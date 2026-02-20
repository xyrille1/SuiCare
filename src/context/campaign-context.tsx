"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { SuiObjectData } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { BookOpen, Droplet, HeartHandshake, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Campaign,
  Milestone,
  NewCampaignData,
  UpdateCampaignData,
} from "@/lib/types";
import { getCampaignStatus } from "@/lib/campaign-status";
import { useRouter } from "next/navigation";

// --- Environment variables and validation ---
function validateEnvVars() {
  const required = {
    SUI_PACKAGE_ID: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID,
    SUI_CAMPAIGNS_ID: process.env.NEXT_PUBLIC_SUI_CAMPAIGNS_ID,
    SUI_ADMIN_ADDRESS: process.env.NEXT_PUBLIC_SUI_ADMIN_ADDRESS,
  };

  const missing: string[] = [];

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(`NEXT_PUBLIC_${key}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\n` +
        `Please create a .env.local file in the root directory and add these variables.\n` +
        `See .env.example for the template.`,
    );
  }

  return required as Record<keyof typeof required, string>;
}

const ENV = validateEnvVars();
export const SUI_PACKAGE_ID = ENV.SUI_PACKAGE_ID;
export const SUI_CAMPAIGNS_ID = ENV.SUI_CAMPAIGNS_ID;
export const ADMIN_ADDRESS = ENV.SUI_ADMIN_ADDRESS;
export type { Campaign } from "@/lib/types";

// --- Type Definitions for Sui Objects ---
interface SuiMilestoneFields {
  description: string;
  percentage: string; // u64 comes as string
  status: number;
  released_amount?: string;
}

interface SuiCampaignFields {
  id: { id: string };
  name: string;
  description: string;
  target_amount: string;
  donated_amount: string;
  total_released?: string;
  recipient: string;
  admin: string;
  escrow: { value: string } | number; // Updated escrow type
  milestones: Array<{ fields: SuiMilestoneFields }>;
}

function isSuiCampaignFields(obj: any): obj is SuiCampaignFields {
  return (
    obj &&
    typeof obj === "object" &&
    obj.id?.id &&
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    typeof obj.target_amount === "string" &&
    typeof obj.donated_amount === "string" &&
    typeof obj.recipient === "string" &&
    typeof obj.admin === "string" &&
    obj.escrow !== undefined && // Updated check
    Array.isArray(obj.milestones)
  );
}

// React context for managing campaign data
interface CampaignContextType {
  campaigns: Campaign[];
  isLoaded: boolean;
  isPending: boolean;
  error: string | null;
  addCampaign: (campaign: NewCampaignData, onSuccess?: () => void) => void;
  getCampaignById: (id: string) => Campaign | undefined;
  updateCampaign: (
    campaign: UpdateCampaignData,
    onSuccess?: () => void,
  ) => void;
  deleteCampaign: (id: string, onSuccess?: () => void) => void;
  donateToCampaign: (id: string, amount: number) => void;
  refetchCampaigns: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(
  undefined,
);

// Helper function to map Sui object to Campaign type
const campaignFromSuiObject = (
  obj: SuiObjectData,
): Omit<Campaign, "icon" | "color" | "iconColor"> | null => {
  if (obj.content?.dataType !== "moveObject") {
    console.warn(
      "Invalid object type, expected moveObject but got:",
      obj.content?.dataType,
    );
    return null;
  }

  const fields = (obj.content.fields as any).value.fields;

  if (!isSuiCampaignFields(fields)) {
    console.warn("Invalid campaign fields:", fields);
    return null;
  }

  try {
    const milestones = fields.milestones.map((m): Milestone => {
      if (
        !m.fields ||
        typeof m.fields.description !== "string" ||
        typeof m.fields.percentage !== "string" ||
        typeof m.fields.status !== "number"
      ) {
        throw new Error("Invalid milestone structure");
      }
      const percentage = parseInt(m.fields.percentage, 10);
      if (isNaN(percentage)) {
        throw new Error(
          `Invalid percentage in milestone: ${m.fields.percentage}`,
        );
      }
      return {
        description: m.fields.description,
        percentage: percentage,
        status: m.fields.status,
      };
    });

    const targetAmount = parseInt(fields.target_amount, 10);
    const donatedAmount = parseInt(fields.donated_amount, 10);
    const totalReleased = fields.total_released
      ? parseInt(fields.total_released, 10)
      : 0;

    // Robustly parse escrow balance
    const escrowBalance =
      typeof fields.escrow === "object" &&
      fields.escrow !== null &&
      "value" in fields.escrow
        ? parseInt((fields.escrow as { value: string }).value, 10)
        : 0;

    if (
      isNaN(targetAmount) ||
      isNaN(donatedAmount) ||
      isNaN(escrowBalance) ||
      isNaN(totalReleased)
    ) {
      throw new Error("Failed to parse numeric fields");
    }

    const normalizedCampaign: Omit<Campaign, "icon" | "color" | "iconColor"> = {
      id: fields.id.id,
      name: fields.name,
      title: fields.name,
      description: fields.description,
      targetAmount,
      goal: targetAmount,
      donatedAmount,
      raised: donatedAmount,
      recipient: fields.recipient,
      recipientAddress: fields.recipient,
      admin: fields.admin, // Use real admin from blockchain
      totalReleased,
      escrowBalance: escrowBalance,
      milestones: milestones,
    };

    return {
      ...normalizedCampaign,
      status: getCampaignStatus(normalizedCampaign),
    };
  } catch (e: any) {
    console.error(
      `Failed to parse campaign object ${fields.id?.id}:`,
      e.message,
      { fields },
    );
    return null;
  }
};

// --- CAMPAIGN PROVIDER COMPONENT ---

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute, isPending } =
    useSignAndExecuteTransactionBlock();

  const ICONS = [
    { icon: Droplet, color: "bg-blue-100", iconColor: "text-blue-500" },
    { icon: Package, color: "bg-orange-100", iconColor: "text-orange-500" },
    { icon: BookOpen, color: "bg-green-100", iconColor: "text-green-500" },
    { icon: HeartHandshake, color: "bg-pink-100", iconColor: "text-pink-500" },
  ];

  const fetchCampaigns = useCallback(async () => {
    setError(null);
    setIsLoaded(false);
    try {
      // First, verify the main campaigns object exists to give a better error.
      const campaignsObject = await suiClient.getObject({
        id: SUI_CAMPAIGNS_ID,
      });

      if (campaignsObject.error && campaignsObject.error.code === "notExists") {
        const network = process.env.NEXT_PUBLIC_SUI_NETWORK || "unknown";
        const objectId = process.env.NEXT_PUBLIC_SUI_CAMPAIGNS_ID || "not set";

        throw new Error(
          `The main Campaigns object was not found on ${network} network.\n` +
            `Object ID: ${objectId}\n` +
            `Please:\n` +
            `1. Verify NEXT_PUBLIC_SUI_CAMPAIGNS_ID in .env.local\n` +
            `2. Ensure you're connected to the correct network\n` +
            `3. Deploy the Campaigns object if it doesn't exist yet`,
        );
      }

      const { data } = await suiClient.getDynamicFields({
        parentId: SUI_CAMPAIGNS_ID,
      });

      if (data.length === 0) {
        setCampaigns([]);
        setIsLoaded(true);
        return;
      }

      const campaign_ids = data.map((field) => field.objectId);

      const campaigns_objects = await suiClient.multiGetObjects({
        ids: campaign_ids,
        options: { showContent: true, showType: true, showDisplay: true },
      });

      const fetchedCampaigns = campaigns_objects
        .map((obj) => {
          if (!obj.data) {
            console.warn(`Object has no data.`);
            return null;
          }
          return campaignFromSuiObject(obj.data);
        })
        .filter(
          (campaign): campaign is NonNullable<typeof campaign> =>
            campaign !== null,
        )
        .map((campaignData, index) => ({
          ...campaignData,
          ...ICONS[index % ICONS.length],
        }));

      setCampaigns(fetchedCampaigns);
    } catch (e: any) {
      console.error("Failed to fetch campaigns:", e);
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      setError(
        `Could not load campaign data from the network. ${errorMessage}`,
      );
      toast({
        title: "Error Fetching Campaigns",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoaded(true);
    }
  }, [suiClient]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const getCampaignById = useCallback(
    (id: string) => {
      return campaigns.find((c) => c.id === id);
    },
    [campaigns],
  );

  // --- CORE TRANSACTION LOGIC ---

  const addCampaign = async (data: NewCampaignData, onSuccess?: () => void) => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a campaign.",
        variant: "destructive",
      });
      return;
    }

    const txb = new TransactionBlock();
    txb.setSender(currentAccount.address);
    txb.setGasBudget(10_000_000);

    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::create_campaign`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure.string(data.title),
        txb.pure.string(data.description),
        txb.pure.u64(data.goal),
        txb.pure.address(data.recipientAddress),
      ],
    });

    try {
      const txBytes = await txb.build({ client: suiClient });
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
      });

      if (dryRunResult.effects.status.status !== "success") {
        const errorMsg = dryRunResult.effects.status.error || "Dry run failed";
        toast({
          title: "Transaction Validation Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      signAndExecute(
        {
          transactionBlock: txb,
          options: { showEffects: true, showEvents: true },
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Campaign Created!",
              description: `Transaction: ${result.digest}`,
            });
            fetchCampaigns();
            if (onSuccess) onSuccess();
            router.push("/");
          },
          onError: (error) => {
            toast({
              title: "Creation Failed",
              description: error.message,
              variant: "destructive",
            });
          },
        },
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const updateCampaign = async (
    data: UpdateCampaignData,
    onSuccess?: () => void,
  ) => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to update campaigns.",
        variant: "destructive",
      });
      return;
    }
    if (currentAccount.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      toast({
        title: "Unauthorized",
        description: "Only the configured admin address can update campaigns.",
        variant: "destructive",
      });
      return;
    }
    const txb = new TransactionBlock();
    txb.setSender(currentAccount.address);
    txb.setGasBudget(10_000_000);

    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::update_campaign`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure(data.id, "address"),
        txb.pure.string(data.title),
        txb.pure.string(data.description),
        txb.pure.u64(data.goal),
        txb.pure.address(data.recipientAddress),
      ],
    });

    try {
      const txBytes = await txb.build({ client: suiClient });
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
      });

      if (dryRunResult.effects.status.status !== "success") {
        const errorMsg = dryRunResult.effects.status.error || "Dry run failed";
        toast({
          title: "Transaction Validation Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      signAndExecute(
        {
          transactionBlock: txb,
          options: { showEffects: true, showEvents: true },
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Campaign Updated!",
              description: `Transaction: ${result.digest}`,
            });
            fetchCampaigns();
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
            toast({
              title: "Update Failed",
              description: error.message,
              variant: "destructive",
            });
          },
        },
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async (campaignId: string, onSuccess?: () => void) => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }
    if (currentAccount.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      toast({
        title: "Unauthorized",
        description: "Only the configured admin address can delete campaigns.",
        variant: "destructive",
      });
      return;
    }

    const campaign = campaigns.find((item) => item.id === campaignId);
    if (
      campaign &&
      campaign.admin.toLowerCase() !== currentAccount.address.toLowerCase()
    ) {
      toast({
        title: "On-chain Admin Mismatch",
        description:
          "This campaign can only be deleted by its original on-chain admin address.",
        variant: "destructive",
      });
      return;
    }

    const txb = new TransactionBlock();
    txb.setSender(currentAccount.address);
    txb.setGasBudget(10_000_000);

    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::emergency_refund`,
      arguments: [txb.object(SUI_CAMPAIGNS_ID), txb.pure.address(campaignId)],
    });

    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::delete_campaign`,
      arguments: [txb.object(SUI_CAMPAIGNS_ID), txb.pure.address(campaignId)],
    });

    try {
      const txBytes = await txb.build({ client: suiClient });
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
      });

      if (dryRunResult.effects.status.status !== "success") {
        const errorMsg = dryRunResult.effects.status.error || "Dry run failed";
        toast({
          title: "Transaction Validation Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      signAndExecute(
        {
          transactionBlock: txb,
          options: { showEffects: true, showEvents: true },
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Campaign Deleted",
              description: `Transaction: ${result.digest}`,
            });
            setCampaigns((prev) =>
              prev.filter((campaign) => campaign.id !== campaignId),
            );
            fetchCampaigns();
            router.refresh();
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
            toast({
              title: "Delete Failed",
              description: error.message,
              variant: "destructive",
            });
          },
        },
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const donateToCampaign = async (campaignId: string, amount: number) => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to donate.",
        variant: "destructive",
      });
      return;
    }

    const campaign = campaigns.find((item) => item.id === campaignId);
    if (
      campaign &&
      campaign.targetAmount > 0 &&
      campaign.donatedAmount >= campaign.targetAmount
    ) {
      toast({
        title: "Goal Reached",
        description:
          "This campaign is fully funded. New donations are disabled.",
        variant: "destructive",
      });
      return;
    }

    const txb = new TransactionBlock();
    txb.setSender(currentAccount.address);
    txb.setGasBudget(10_000_000);

    const amountInMist = amount * 1_000_000_000;

    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInMist)]);

    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::donate`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure.address(campaignId),
        coin,
      ],
    });

    try {
      const txBytes = await txb.build({ client: suiClient });
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
      });

      if (dryRunResult.effects.status.status !== "success") {
        const errorMsg = dryRunResult.effects.status.error || "Dry run failed";
        toast({
          title: "Transaction Validation Failed",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      signAndExecute(
        {
          transactionBlock: txb,
          options: { showEffects: true, showEvents: true },
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Donation Successful!",
              description: `You donated ${amount} SUI. Transaction: ${result.digest}`,
            });
            fetchCampaigns();
          },
          onError: (error) => {
            toast({
              title: "Donation Failed",
              description: error.message,
              variant: "destructive",
            });
          },
        },
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    campaigns,
    isLoaded,
    isPending,
    error,
    addCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    donateToCampaign,
    refetchCampaigns: fetchCampaigns,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

// Custom hook to use the CampaignContext
export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaigns must be used within a CampaignProvider");
  }
  return context;
}
