"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Coins, Loader2 } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  MilestoneProgressDisplay,
  RequestReleaseButton,
  AdminVerificationPanel,
} from "./milestone-components";
import { useCampaigns } from "@/context/campaign-context";
import { Campaign } from "@/lib/types";
import { getDonationSuggestions } from "@/app/actions";

const donationSchema = z.object({
  amount: z.coerce
    .number({
      required_error: "Please enter an amount.",
      invalid_type_error: "Please enter a valid number.",
    })
    .min(0.000000001, "Donation must be a positive number.")
    .positive("Donation must be a positive number."),
});

type DonationFormValues = z.infer<typeof donationSchema>;

// FIX 1: Define an extended type that includes the missing properties.
// We use '&' to safely extend it whether 'Campaign' is a type or an interface.
type ExtendedCampaign = Campaign & {
  goal: number;
  milestones: {
    percentage: number;
    status: number;
  }[];
  recipientAddress: string;
  adminAddress: string;
};

interface DonationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function DonationDrawer({
  open,
  onOpenChange,
  campaign: initialCampaign,
}: DonationDrawerProps) {
  const { getCampaignById, isLoaded, donateToCampaign, isPending } =
    useCampaigns();
  const currentAccount = useCurrentAccount();
  const [suggestions, setSuggestions] = useState<number[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // FIX 2: Cast the retrieved campaign to our ExtendedCampaign type
  const campaign = initialCampaign
    ? (getCampaignById(initialCampaign.id) as ExtendedCampaign)
    : null;

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 10,
    },
  });

  useEffect(() => {
    if (open && campaign) {
      form.reset({ amount: 10 });
      setLoadingSuggestions(true);

      // FIX 3: Add nullish coalescing (?? "") to handle potential undefined strings
      getDonationSuggestions({
        title: campaign.title ?? "Campaign",
        description: campaign.description ?? "",
        goal: campaign.goal,
      })
        .then((fetchedSuggestions) => {
          const uniqueSuggestions = Array.from(new Set(fetchedSuggestions));
          setSuggestions(uniqueSuggestions);
        })
        .catch((error) => {
          console.error("Error fetching donation suggestions:", error);
          setSuggestions([]);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    }
  }, [open, campaign, form]);

  function onSubmit(data: DonationFormValues) {
    if (!campaign) return;
    donateToCampaign(campaign.id, data.amount);
  }

  const renderContent = () => {
    if (!isLoaded || !campaign) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <>
        <SheetHeader>
          <SheetTitle>Donate to {campaign.title}</SheetTitle>
          <SheetDescription>
            Your donation is processed on the Sui testnet. 100% of your SUI goes
            directly to the cause.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
          <MilestoneProgressDisplay
            milestones={campaign.milestones}
            escrowBalance={campaign.escrowBalance}
            goal={campaign.goal}
          />
          <div className="mt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (in SUI)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="10"
                            className="pl-9"
                            {...field}
                            step="any"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        You are on the Sui Testnet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {loadingSuggestions ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  suggestions.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {suggestions.map((amount, index) => (
                        <Button
                          key={`${amount}-${index}`}
                          type="button"
                          variant="outline"
                          onClick={() =>
                            form.setValue("amount", amount, {
                              shouldValidate: true,
                            })
                          }
                        >
                          {amount} SUI
                        </Button>
                      ))}
                    </div>
                  )
                )}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending
                    ? "Processing..."
                    : `Donate ${form.watch("amount") || 0} SUI`}
                </Button>
              </form>
            </Form>
          </div>
          {currentAccount?.address === campaign.recipientAddress && (
            <div className="mt-8">
              {campaign.milestones.map((milestone, index) => {
                const isFunded =
                  (campaign.escrowBalance / campaign.goal) * 100 >=
                  milestone.percentage;
                if (milestone.status === 0 && isFunded) {
                  return (
                    <RequestReleaseButton
                      key={index}
                      campaignId={campaign.id}
                      milestoneIndex={index}
                      creatorAddress={campaign.recipientAddress}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
          {currentAccount?.address === campaign.adminAddress && (
            <AdminVerificationPanel
              campaignId={campaign.id}
              milestones={campaign.milestones}
              adminAddress={campaign.adminAddress}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isPending) {
          onOpenChange(isOpen);
        }
      }}
    >
      <SheetContent className="sm:max-w-md">{renderContent()}</SheetContent>
    </Sheet>
  );
}
