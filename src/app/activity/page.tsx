"use client";

import { useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type ActivityFilter = "all" | "donations" | "milestones" | "admin";

interface ParsedEvent {
  type: string;
  parsedJson?: Record<string, unknown>;
  timestampMs?: string;
  id?: { txDigest: string; eventSeq: string };
}

interface ActivityItem {
  id: string;
  filter: ActivityFilter;
  typeLabel: string;
  actor?: string;
  campaignId?: string;
  amountSui?: string;
  digest?: string;
  timeLabel: string;
}

const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID!;
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet";

const shortAddress = (value?: string) =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Unknown";

const toSui = (amount?: unknown) => {
  const value = Number(amount);
  if (Number.isNaN(value)) return undefined;
  return (value / 1_000_000_000).toFixed(4);
};

const parseTimestamp = (timestampMs?: string) => {
  if (!timestampMs) return "Unknown time";
  const parsed = Number(timestampMs);
  if (Number.isNaN(parsed)) return "Unknown time";
  return `${formatDistanceToNow(new Date(parsed), { addSuffix: true })}`;
};

function mapEventToActivityItem(event: ParsedEvent): ActivityItem {
  const parsed = event.parsedJson ?? {};
  const eventType = event.type.split("::").pop() ?? "UnknownEvent";
  const digest = event.id?.txDigest;
  const defaultItem: ActivityItem = {
    id: `${digest ?? "unknown"}-${event.id?.eventSeq ?? "0"}`,
    filter: "all",
    typeLabel: eventType,
    timeLabel: parseTimestamp(event.timestampMs),
    digest,
  };

  if (eventType === "Donated") {
    return {
      ...defaultItem,
      filter: "donations",
      typeLabel: "Donation",
      actor: typeof parsed.donor === "string" ? parsed.donor : undefined,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
      amountSui: toSui(parsed.amount),
    };
  }

  if (eventType === "MilestoneStatusUpdated") {
    const status = Number(parsed.status);
    const statusLabel =
      status === 1
        ? "Milestone Requested"
        : status === 2
          ? "Milestone Released"
          : "Milestone Updated";
    return {
      ...defaultItem,
      filter: "milestones",
      typeLabel: statusLabel,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
      amountSui: toSui(parsed.amount),
    };
  }

  if (eventType === "CampaignCreated") {
    return {
      ...defaultItem,
      filter: "admin",
      typeLabel: "Campaign Created",
      actor: typeof parsed.creator === "string" ? parsed.creator : undefined,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
    };
  }

  if (eventType === "CampaignUpdated") {
    return {
      ...defaultItem,
      filter: "admin",
      typeLabel: "Campaign Updated",
      actor: typeof parsed.updater === "string" ? parsed.updater : undefined,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
    };
  }

  if (eventType === "CampaignDeleted") {
    return {
      ...defaultItem,
      filter: "admin",
      typeLabel: "Campaign Deleted",
      actor: typeof parsed.deleter === "string" ? parsed.deleter : undefined,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
    };
  }

  if (eventType === "AdminTransferred") {
    return {
      ...defaultItem,
      filter: "admin",
      typeLabel: "Admin Transferred",
      actor:
        typeof parsed.new_admin === "string" ? parsed.new_admin : undefined,
      campaignId:
        typeof parsed.campaign_id === "string" ? parsed.campaign_id : undefined,
    };
  }

  return defaultItem;
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [showMineOnly, setShowMineOnly] = useState(false);
  const currentAccount = useCurrentAccount();
  const { network } = useSuiClientContext();
  const suiClient = useSuiClient();

  const { data, isLoading, isError } = useQuery<ActivityItem[], Error>({
    queryKey: ["activity", SUI_PACKAGE_ID, network],
    queryFn: async () => {
      const response = await suiClient.queryEvents({
        query: {
          MoveModule: {
            package: SUI_PACKAGE_ID,
            module: "sui_care",
          },
        },
        limit: 100,
        order: "descending",
      });

      return response.data.map((event) =>
        mapEventToActivityItem(event as unknown as ParsedEvent),
      );
    },
    refetchInterval: 10000,
  });

  const filteredItems = useMemo(() => {
    const base = data ?? [];
    const byFilter =
      filter === "all" ? base : base.filter((item) => item.filter === filter);

    if (!showMineOnly || !currentAccount?.address) {
      return byFilter;
    }

    return byFilter.filter(
      (item) =>
        item.actor?.toLowerCase() === currentAccount.address.toLowerCase(),
    );
  }, [data, filter, showMineOnly, currentAccount?.address]);

  const explorerNetwork = network || SUI_NETWORK;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground mt-2">
          Live on-chain events for campaigns, donations, milestones, and admin
          actions.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "donations" ? "default" : "outline"}
          onClick={() => setFilter("donations")}
        >
          Donations
        </Button>
        <Button
          variant={filter === "milestones" ? "default" : "outline"}
          onClick={() => setFilter("milestones")}
        >
          Milestones
        </Button>
        <Button
          variant={filter === "admin" ? "default" : "outline"}
          onClick={() => setFilter("admin")}
        >
          Admin Actions
        </Button>
        <Button
          variant={showMineOnly ? "default" : "outline"}
          onClick={() => setShowMineOnly((prev) => !prev)}
          disabled={!currentAccount}
        >
          My Activity
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load activity</AlertTitle>
          <AlertDescription>
            Please check your network connection and Sui configuration.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && filteredItems.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No activity yet</CardTitle>
            <CardDescription>
              Create or donate to a campaign to see activity here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.typeLabel}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.timeLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.actor ? `Actor: ${shortAddress(item.actor)} · ` : ""}
                    {item.campaignId
                      ? `Campaign: ${shortAddress(item.campaignId)}`
                      : "Campaign: Unknown"}
                    {item.amountSui ? ` · Amount: ${item.amountSui} SUI` : ""}
                  </p>
                </div>
                {item.digest && (
                  <a
                    href={`https://suiexplorer.com/txblock/${item.digest}?network=${explorerNetwork}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View transaction
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
