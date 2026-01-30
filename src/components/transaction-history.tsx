import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit';
import { SuiObjectData } from '@mysten/sui.js/client';
import { useQuery } from '@tanstack/react-query';
import { TransactionHistoryUI } from './ui/transaction-history';

const SUI_CARE_PACKAGE_ID = '0xYOUR_PACKAGE_ID'; // Replace with your package ID

export function TransactionHistory({ campaignId }: { campaignId: string }) {
  const suiClient = useSuiClient();
  const { network } = useSuiClientContext();

  const { data, isLoading, isError } = useQuery<SuiObjectData[], Error>({
    queryKey: ['transactionHistory', campaignId, network],
    queryFn: async () => {
      const { data } = await suiClient.getDynamicFields({
        parentId: campaignId,
      });

      const donationIds = data.map((field) => field.objectId);

      return suiClient.multiGetObjects({
        ids: donationIds,
        options: { showContent: true },
      });
    },
  });

  return (
    <TransactionHistoryUI
      data={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
