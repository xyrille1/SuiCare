"use client";

import { useMemo } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Milestone } from "@/lib/types";
import {
  SUI_PACKAGE_ID,
  SUI_CAMPAIGNS_ID,
  ADMIN_ADDRESS,
} from "@/context/campaign-context";
import { useCampaigns } from "@/context/campaign-context";

// MilestoneProgressDisplay Component
interface MilestoneProgressDisplayProps {
  milestones: Milestone[];
  escrowBalance: number;
  goal: number;
}

export function MilestoneProgressDisplay({
  milestones,
  escrowBalance,
  goal,
}: MilestoneProgressDisplayProps) {
  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);

  if (totalPercentage !== 100) {
    return (
      <div className="text-center p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-bold">Milestone Configuration Error</p>
        <p className="text-sm">
          The sum of milestone percentages must equal 100%. Current total:{" "}
          {totalPercentage}%.
        </p>
      </div>
    );
  }

  const getMilestoneStatusIcon = (status: number) => {
    switch (status) {
      case 1: // Requested
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 2: // Released
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 0: // Pending
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getMilestoneStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Requested";
      case 2:
        return "Released";
      case 0:
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-semibold">Milestones</p>
      <ul className="space-y-3">
        {milestones.map((milestone, index) => {
          const isFunded = (escrowBalance / goal) * 100 >= milestone.percentage;
          return (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMilestoneStatusIcon(milestone.status)}
                <div>
                  <p
                    className={`font-medium ${isFunded ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {milestone.percentage}% - {milestone.description}
                  </p>
                  <p
                    className={`text-sm ${isFunded ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    Status: {getMilestoneStatusText(milestone.status)}
                  </p>
                </div>
              </div>
              <p
                className={`font-semibold text-sm ${isFunded ? "text-foreground" : "text-muted-foreground"}`}
              >
                {((milestone.percentage / 100) * goal).toLocaleString()} SUI
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// RequestReleaseButton Component
interface RequestReleaseButtonProps {
  campaignId: string;
  milestoneIndex: number;
  creatorAddress: string;
}

export function RequestReleaseButton({
  campaignId,
  milestoneIndex,
  creatorAddress,
}: RequestReleaseButtonProps) {
  const { mutate: signAndExecute, isPending } =
    useSignAndExecuteTransactionBlock();
  const { toast } = useToast();
  const { refetchCampaigns } = useCampaigns();

  const handleRequest = () => {
    const txb = new TransactionBlock();
    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::request_release`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure(campaignId, "address"),
        txb.pure(milestoneIndex, "u64"),
      ],
    });

    signAndExecute(
      { transactionBlock: txb, options: { showEffects: true } },
      {
        onSuccess: (result) => {
          toast({
            title: "Success",
            description: `Milestone release requested. Digest: ${result.digest.slice(0, 10)}...`,
          });
          refetchCampaigns();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Button
      onClick={handleRequest}
      disabled={isPending}
      className="w-full mt-4"
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isPending
        ? "Requesting..."
        : `Request Release for Milestone #${milestoneIndex + 1}`}
    </Button>
  );
}

// AdminVerificationPanel Component
interface AdminVerificationPanelProps {
  campaignId: string;
  milestones: Milestone[];
  adminAddress: string;
}

export function AdminVerificationPanel({
  campaignId,
  milestones,
  adminAddress,
}: AdminVerificationPanelProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } =
    useSignAndExecuteTransactionBlock();
  const { toast } = useToast();
  const { refetchCampaigns } = useCampaigns();
  const isConfiguredAdmin =
    currentAccount?.address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const requestedMilestones = useMemo(() => {
    return milestones
      .map((milestone, index) => ({ ...milestone, index }))
      .filter((m) => m.status === 1); // 1 = Requested
  }, [milestones]);

  const handleVerification = (milestoneIndex: number) => {
    if (!isConfiguredAdmin) {
      toast({
        title: "Unauthorized",
        description: "Only the configured admin address can verify milestones.",
        variant: "destructive",
      });
      return;
    }

    const txb = new TransactionBlock();
    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::verify_and_release`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure(campaignId, "address"),
        txb.pure(milestoneIndex, "u64"),
      ],
    });

    signAndExecute(
      { transactionBlock: txb, options: { showEffects: true } },
      {
        onSuccess: (result) => {
          toast({
            title: "Success",
            description: `Milestone verified and funds released. Digest: ${result.digest.slice(0, 10)}...`,
          });
          refetchCampaigns();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  if (requestedMilestones.length === 0) {
    return null; // Don't show the panel if no milestones are pending verification
  }

  if (!isConfiguredAdmin) {
    return null;
  }

  return (
    <div className="mt-8 p-4 border-l-4 border-primary bg-primary/10">
      <h3 className="font-bold mb-4">Admin Verification</h3>
      <div className="space-y-3">
        {requestedMilestones.map((m) => (
          <div
            key={m.index}
            className="flex items-center justify-between p-3 rounded-md bg-background"
          >
            <div>
              <p className="font-semibold">
                Milestone #{m.index + 1}: {m.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Release of {m.percentage}% of funds requested.
              </p>
            </div>
            <Button
              onClick={() => handleVerification(m.index)}
              disabled={isPending || !isConfiguredAdmin}
              size="sm"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify & Release
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
