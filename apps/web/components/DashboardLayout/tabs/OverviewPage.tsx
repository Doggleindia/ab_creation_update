"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserProfile } from "@/lib/api";
import EmailAlert from "../MainContent/EmailAlert";
import OfferBanner from "../MainContent/OfferBanner";
import StatsCards from "../MainContent/StatsCards";

interface Stat {
  label: string;
  value: number;
}

export default function OverviewPage() {
  const [dateFilter, setDateFilter] = useState("last7days");
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total orders", value: 0 },
    { label: "Products", value: 0 },
    { label: "Custom", value: 0 },
    { label: "Wallet", value: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await getUserProfile(token || undefined, dateFilter);

        if (response.status === "success" && response.data?.stats) {
          const profileStats = response.data.stats;
          setStats([
            { label: "Total orders", value: profileStats.totalOrders || 0 },
            { label: "Products", value: profileStats.productsOrders || 0 },
            { label: "Custom", value: profileStats.ApperalOrders || 0 },
            { label: "Wallet", value: profileStats.walletBalance || 0 },
          ]);
        }
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="w-48">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="onemonth">One Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatsCards stats={stats} loading={loading} />
      <EmailAlert />
      <OfferBanner />
    </div>
  )
}
