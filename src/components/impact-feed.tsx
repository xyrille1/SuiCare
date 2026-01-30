"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Donation {
  id: number;
  name: string;
  amount: number;
  time: string;
  color: string;
}

const initialDonations: Donation[] = [
  { id: 3, name: 'Anonymous', amount: 5, time: '5m ago', color: 'bg-red-100 text-red-800' },
  { id: 2, name: 'Maria', amount: 50, time: '3m ago', color: 'bg-blue-100 text-blue-800' },
  { id: 1, name: 'Alex', amount: 15, time: '1m ago', color: 'bg-green-100 text-green-800' },
];

const mockNames = ['Jordan', 'Casey', 'Taylor', 'Anonymous', 'Sam', 'Robin'];
const mockColors = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
]

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
          color: mockColors[Math.floor(Math.random() * mockColors.length)],
        };
        const updatedDonations = [newDonation, ...prev];
        if (updatedDonations.length > 5) {
            updatedDonations.pop();
        }
        // Update timestamps
        return updatedDonations.map((d, i) => {
            if (i === 0) return d;
            const minutes = i * 2 + 1;
            return {...d, time: `${minutes}m ago`};
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">Live Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="flex items-center gap-3 transition-all">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${donation.color}`}>
                 {donation.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {donation.name}{' '}
                  <span className="font-normal text-muted-foreground">
                    donated{' '}
                  </span>
                  <span className="font-bold text-foreground">{donation.amount} SUI</span>
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
