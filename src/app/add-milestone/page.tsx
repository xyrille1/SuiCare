"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCampaigns } from "@/context/campaign-context";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import { toast } from "@/hooks/use-toast";
import { ADMIN_ADDRESS } from "@/context/campaign-context";

const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID!;
const SUI_CAMPAIGNS_ID = process.env.NEXT_PUBLIC_SUI_CAMPAIGNS_ID!;

// This component ensures that its children are only rendered on the client side.
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

const milestoneSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long."),
  percentage: z.coerce
    .number()
    .int()
    .positive("Percentage must be a positive whole number.")
    .max(100, "Percentage cannot exceed 100."),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

function AddMilestonePageContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: "",
      percentage: 25,
    },
  });

  async function onSubmit(data: MilestoneFormValues) {
    if (!campaignId) {
      toast({
        title: "Error",
        description: "Campaign ID is missing.",
        variant: "destructive",
      });
      return;
    }

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
        description: "Only the configured admin address can add milestones.",
        variant: "destructive",
      });
      return;
    }

    const txb = new TransactionBlock();
    txb.moveCall({
      target: `${SUI_PACKAGE_ID}::sui_care::add_milestone`,
      arguments: [
        txb.object(SUI_CAMPAIGNS_ID),
        txb.pure(campaignId, "address"),
        txb.pure(data.description, "string"),
        txb.pure(data.percentage, "u64"),
      ],
    });

    try {
      const txBytes = await txb.build({ client: suiClient });
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: txBytes,
      });
      if (dryRunResult.effects.status.status !== "success") {
        const errorMsg =
          dryRunResult.effects.status.error ||
          "Dry run failed with an unknown error.";
        console.error("Transaction dry run failed:", errorMsg);
        toast({
          title: "Transaction Validation Failed",
          description: `Error: ${errorMsg}`,
          variant: "destructive",
        });
        return;
      }

      signAndExecute(
        { transactionBlock: txb, options: { showEffects: true } },
        {
          onSuccess: (result) => {
            toast({
              title: "Milestone Added Successfully!",
              description: `Transaction Digest: ${result.digest}`,
            });
          },
          onError: (error) => {
            toast({
              title: "Transaction Failed",
              description: error.message,
              variant: "destructive",
            });
          },
        },
      );
    } catch (e: any) {
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${e.message}`,
        variant: "destructive",
      });
    }
  }

  return (
    <ClientOnly>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft />
              Back to Campaigns
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Add a New Milestone
        </h1>
        <p className="text-muted-foreground mb-8">
          Add a new milestone to an existing campaign.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Describe the milestone in detail..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Percentage</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25" {...field} />
                  </FormControl>
                  <FormDescription>
                    The percentage of the total goal to be released upon
                    verification.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin" />
                )}
                {form.formState.isSubmitting ? "Adding..." : "Add Milestone"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ClientOnly>
  );
}

export default function AddMilestonePage() {
  return (
    <Suspense fallback={null}>
      <AddMilestonePageContent />
    </Suspense>
  );
}
