"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Coins, Loader2 } from "lucide-react";

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
    .min(1, "Donation must be at least 1 SUI to be eligible for gas sponsorship.")
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 10,
    },
  });

  async function onSubmit(data: DonationFormValues) {
    setIsSubmitting(true);
    // Simulate API call to sponsored transaction endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onOpenChange(false);
    form.reset();

    toast({
      title: "Donation Successful!",
      description: `Thank you for your donation of ${data.amount} SUI. Your Impact Receipt NFT has been minted.`,
      variant: "default",
    });
  }

  if (!campaign) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Donate to {campaign.title}</SheetTitle>
          <SheetDescription>
            Your donation is processed gas-free. 100% of your SUI goes directly to the cause.
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
                      Minimum donation of 1 SUI is required.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Processing..." : `Donate ${form.watch("amount") || 0} SUI`}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
