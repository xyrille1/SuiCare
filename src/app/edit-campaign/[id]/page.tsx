'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCampaigns } from "@/context/campaign-context";

// This component ensures that its children are only rendered on the client side.
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = useState(false);
  
    useEffect(() => {
      setHasMounted(true);
    }, []);
  
    if (!hasMounted) {
      return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      );
    }
  
    return <>{children}</>;
};

const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  goal: z.coerce.number().int().positive("Goal must be a positive whole number."),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Please enter a valid 64-character Sui address starting with 0x."),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function EditCampaignPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { getCampaignById, updateCampaign, isLoaded } = useCampaigns();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: 0,
      recipientAddress: "",
    },
  });

  useEffect(() => {
    if (isLoaded) {
      const campaignId = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!campaignId) {
        router.push("/");
        return;
      }
      const campaignToEdit = getCampaignById(campaignId);
      if (campaignToEdit) {
        form.reset({
          title: campaignToEdit.title,
          description: campaignToEdit.description,
          goal: campaignToEdit.goal,
          recipientAddress: campaignToEdit.recipientAddress,
        });
      } else {
        toast({
          title: "Campaign not found",
          description: "The campaign you are trying to edit does not exist.",
          variant: "destructive",
        });
        router.push("/");
      }
    }
  }, [isLoaded, params.id, getCampaignById, form, router, toast]);

  function onSubmit(data: CampaignFormValues) {
    const campaignId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!campaignId) return;

    updateCampaign({
        id: campaignId,
        ...data,
    });
  }

  return (
    <ClientOnly>
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
            <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft />
                    Back to Campaigns
                </Link>
            </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Your Campaign</h1>
            <p className="text-muted-foreground mb-8">
            Update the details for your campaign.
            </p>
            
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 'Community Art Project'" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea rows={5} placeholder="Describe your campaign\'s mission and goals in detail..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Funding Goal (SUI)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormDescription>
                        The amount of SUI you aim to raise. Must be a whole number.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Recipient Sui Address</FormLabel>
                    <FormControl>
                        <Input placeholder="0x..." {...field} />
                    </FormControl>
                    <FormDescription>
                        This is the Sui wallet address where donations will be sent.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                </div>
            </form>
            </Form>
        </div>
    </ClientOnly>
  );
}
