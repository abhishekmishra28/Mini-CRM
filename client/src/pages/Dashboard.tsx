import React from 'react';
import { Users, ShoppingBag, TrendingUp, Megaphone, ArrowUpRight, Activity, Loader2 } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { analytics, loading } = useDashboard();

  if (loading || !analytics) {
    return (
      <div className="p-6 flex flex-col justify-center items-center h-full gap-3">
        <Loader2 size={32} className="animate-spin text-violet-500" />
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const topCampaigns = analytics.campaign_stats
    .filter((c: any) => c.total_sent > 0)
    .sort((a: any, b: any) => b.delivery_rate - a.delivery_rate)
    .slice(0, 5);

  const channelColors: Record<string, string> = {
    whatsapp: 'text-green-400 bg-green-400/10',
    sms: 'text-blue-400 bg-blue-400/10',
    email: 'text-purple-400 bg-purple-400/10',
    rcs: 'text-orange-400 bg-orange-400/10',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Overview of your shoppers and campaign performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={18} className="text-violet-400" />}
          label="Total Shoppers"
          value={analytics.total_customers.toLocaleString()}
          sub="in your database"
          color="bg-violet-400/10"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-emerald-400" />}
          label="Total Revenue"
          value={`₹${(analytics.total_revenue / 100000).toFixed(1)}L`}
          sub={`${analytics.total_orders.toLocaleString()} orders`}
          color="bg-emerald-400/10"
        />
        <StatCard
          icon={<ShoppingBag size={18} className="text-blue-400" />}
          label="Avg Order Value"
          value={`₹${Math.round(analytics.avg_order_value).toLocaleString()}`}
          sub="per transaction"
          color="bg-blue-400/10"
        />
        <StatCard
          icon={<Megaphone size={18} className="text-amber-400" />}
          label="Campaigns"
          value={analytics.total_campaigns.toString()}
          sub={`${analytics.communications_total} messages sent`}
          color="bg-amber-400/10"
        />
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campaign performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Top Campaigns</h2>
            <Activity size={16} className="text-gray-500" />
          </div>
          {topCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No campaigns sent yet</p>
              <p className="text-gray-600 text-xs mt-1">Create and send your first campaign</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCampaigns.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${channelColors[c.channel]}`}>
                    {c.channel.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate font-medium">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(c.delivery_rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {c.delivery_rate.toFixed(0)}% delivered
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-300 font-medium">{c.total_sent}</p>
                    <p className="text-xs text-gray-600">sent</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message delivery breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Message Delivery Stats</h2>
            <ArrowUpRight size={16} className="text-gray-500" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Delivered', value: analytics.communications_by_status.delivered, color: 'bg-emerald-500', total: analytics.communications_total },
              { label: 'Opened', value: analytics.communications_by_status.opened, color: 'bg-blue-500', total: analytics.communications_total },
              { label: 'Clicked', value: analytics.communications_by_status.clicked, color: 'bg-violet-500', total: analytics.communications_total },
              { label: 'Failed', value: analytics.communications_by_status.failed, color: 'bg-red-500', total: analytics.communications_total },
              { label: 'In Queue', value: analytics.communications_by_status.queued, color: 'bg-gray-500', total: analytics.communications_total },
            ].map((item) => {
              const pct = analytics.communications_total > 0
                ? (item.value / analytics.communications_total) * 100
                : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">{item.label}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 w-8 text-right">{item.value}</span>
                </div>
              );
            })}
          </div>

          {analytics.communications_total === 0 && (
            <div className="text-center py-4 mt-2">
              <p className="text-gray-600 text-xs">Send a campaign to see delivery stats</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick tips */}
      <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600/30 rounded-lg">
            <Activity size={16} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-violet-200">Getting started</h3>
            <p className="text-xs text-violet-300/70 mt-1">
              1. Browse your <strong>60 pre-loaded shoppers</strong> → 2. Create a <strong>Segment</strong> (manually or via AI) →
              3. Launch a <strong>Campaign</strong> → 4. Watch delivery stats roll in on the <strong>Analytics</strong> page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
