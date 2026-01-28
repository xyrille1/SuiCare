"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Coins, Loader2 } from "lucide-react";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";

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
import { useToast } from "@/hooks/use-toast";
import type { Campaign } from "./campaign-card";

const donationSchema = z.object({
  amount: z.coerce
    .number({
      required_error: "Please enter an amount.",
      invalid_type_error: "Please enter a valid number.",
    })
    .min(0.01, "Donation must be at least 0.01 SUI.")
    .positive("Donation must be a positive number."),
});

type DonationFormValues = z.infer<typeof donationSchema>;

interface DonationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function DonationDrawer({ open, onOpenChange, campaign }: DonationDrawerProps) {
  const { toast } = useToast();
  const { mutate: signAndExecuteTransactionBlock, isPending } = useSignAndExecuteTransactionBlock();

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 10,
    },
  });

  function onSubmit(data: DonationFormValues) {
    if (!campaign) return;

    const txb = new TransactionBlock();
    
    // Note: This is a simple SUI transfer. 1 SUI = 1,000,000,000 MIST.
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(data.amount * 1_000_000_000)]);
    txb.transferObjects([coin], txb.pure(campaign.recipientAddress));

    signAndExecuteTransactionBlock(
      {
        transactionBlock: txb,
        options: {
          showEffects: true,
        },
      },
      {
        onSuccess: (result) => {
          onOpenChange(false);
          form.reset();
          toast({
            title: "Donation Successful!",
            description: `Thank you for your donation of ${data.amount} SUI. Digest: ${result.digest.slice(0,10)}...`,
          });
        },
        onError: (error) => {
          toast({
            title: "Donation Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  }

  if (!campaign) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isPending) {
        onOpenChange(isOpen);
      }
    }}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Donate to {campaign.title}</SheetTitle>
          <SheetDescription>
            Your donation is processed on the Sui testnet. 100% of your SUI goes directly to the cause.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (in SUI)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="number" placeholder="10" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      You are on the Sui Testnet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Processing..." : `Donate ${form.watch("amount") || 0} SUI`}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
