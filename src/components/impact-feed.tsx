"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

interface Donation {
  id: number;
  name: string;
  amount: number;
  time: string;
}

const initialDonations: Donation[] = [
  { id: 3, name: 'Anonymous', amount: 5, time: '5m ago' },
  { id: 2, name: 'Maria', amount: 50, time: '3m ago' },
  { id: 1, name: 'Alex', amount: 15, time: '1m ago' },
];

const mockNames = ['Jordan', 'Casey', 'Taylor', 'Anonymous', 'Sam', 'Robin'];

export function ImpactFeed() {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);

  useEffect(() => {
    const interval = setInterval(() => {
      setDonations(prev => {
        const newId = (prev[0]?.id || 0) + 1;
        const newDonation: Donation = {
          id: newId,
          name: mockNames[Math.floor(Math.random() * mockNames.length)],
          amount: Math.floor(Math.random() * 99) + 1,
          time: 'just now',
        };
        const updatedDonations = [newDonation, ...prev];
        if (updatedDonations.length > 10) {
            updatedDonations.pop();
        }
        // Update timestamps
        return updatedDonations.map((d, i) => i === 0 ? d : {...d, time: `${i * 2 + 1}m ago`});
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="glassmorphic-card">
      <CardHeader>
        <CardTitle>Live Impact Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="flex items-center gap-4 transition-all">
              <Avatar className="h-10 w-10 border">
                 <AvatarFallback className="bg-transparent">
                    <Gift className="h-5 w-5 text-muted-foreground" />
                 </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {donation.name}{' '}
                  <span className="font-normal text-muted-foreground">
                    donated {donation.amount} SUI
                  </span>
                </p>
              </div>
              <div className="text-sm text-muted-foreground">{donation.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
