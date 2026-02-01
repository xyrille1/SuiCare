import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit';
import { SuiObjectData } from '@mysten/sui.js/client';
import { useQuery } from '@tanstack/react-query';
import { TransactionHistoryUI } from './ui/transaction-history';

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

      if (donationIds.length === 0) {
        return [];
      }

      const donations = await suiClient.multiGetObjects({
        ids: donationIds,
        options: { showContent: true },
      });

      // Filter out any errored or non-existent objects and return the data
      return donations
        .filter((donation) => donation.data)
        .map((donation) => donation.data as SuiObjectData);
    },
    enabled: !!campaignId, // only run the query if campaignId is available
    refetchInterval: 5000, // Poll for new data every 5 seconds
  });

  return (
    <TransactionHistoryUI
      data={data}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
