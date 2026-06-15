import { useDashboard } from '../hooks/useDashboard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Target, Zap, Loader2 } from 'lucide-react';

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#22c55e',
  sms: '#3b82f6',
  email: '#a855f7',
  rcs: '#f97316',
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#6b7280'];

export function Analytics() {
  const { analytics, loading } = useDashboard();

  if (loading || !analytics) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
         <Loader2 size={40} className="animate-spin text-violet-500 mx-auto mb-3" />
      </div>
    );
  }

  const completedCampaigns = analytics.campaign_stats.filter((c: any) => c.total_sent > 0);

  // Bar chart data
  const barData = completedCampaigns.map((c: any) => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    Delivered: c.delivered,
    Opened: c.opened,
    Clicked: c.clicked,
    Failed: c.failed,
    channel: c.channel,
  }));

  // Rate chart data
  const rateData = completedCampaigns.map((c: any) => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    'Delivery %': Math.round(c.delivery_rate),
    'Open %': Math.round(c.open_rate),
    'Click %': Math.round(c.click_rate),
  }));

  // Delivery status pie
  const { communications_by_status } = analytics;
  const pieData = [
    { name: 'Delivered', value: communications_by_status.delivered },
    { name: 'Opened', value: communications_by_status.opened },
    { name: 'Clicked', value: communications_by_status.clicked },
    { name: 'Failed', value: communications_by_status.failed },
    { name: 'Queued', value: communications_by_status.queued },
  ].filter((d) => d.value > 0);

  // Channel breakdown
  const channelBreakdown: Record<string, { sent: number; delivered: number; opened: number }> = {};
  analytics.campaign_stats.forEach((c: any) => {
    if (!channelBreakdown[c.channel]) {
      channelBreakdown[c.channel] = { sent: 0, delivered: 0, opened: 0 };
    }
    channelBreakdown[c.channel].sent += c.total_sent;
    channelBreakdown[c.channel].delivered += c.delivered;
    channelBreakdown[c.channel].opened += c.opened;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Campaign performance and communication insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Messages',
            value: analytics.communications_total.toLocaleString(),
            sub: 'across all campaigns',
            icon: <Zap size={16} className="text-violet-400" />,
            color: 'bg-violet-400/10',
          },
          {
            label: 'Avg Delivery Rate',
            value: completedCampaigns.length > 0
              ? `${(completedCampaigns.reduce((s: number, c: any) => s + c.delivery_rate, 0) / completedCampaigns.length).toFixed(0)}%`
              : '—',
            sub: 'delivered/sent',
            icon: <TrendingUp size={16} className="text-emerald-400" />,
            color: 'bg-emerald-400/10',
          },
          {
            label: 'Avg Open Rate',
            value: completedCampaigns.length > 0
              ? `${(completedCampaigns.reduce((s: number, c: any) => s + c.open_rate, 0) / completedCampaigns.length).toFixed(0)}%`
              : '—',
            sub: 'of delivered messages',
            icon: <Target size={16} className="text-blue-400" />,
            color: 'bg-blue-400/10',
          },
          {
            label: 'Avg Click Rate',
            value: completedCampaigns.length > 0
              ? `${(completedCampaigns.reduce((s: number, c: any) => s + c.click_rate, 0) / completedCampaigns.length).toFixed(0)}%`
              : '—',
            sub: 'of opened messages',
            icon: <BarChart3 size={16} className="text-amber-400" />,
            color: 'bg-amber-400/10',
          },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {analytics.communications_total === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <BarChart3 size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No data yet</p>
          <p className="text-gray-600 text-sm mt-1">Send a campaign to see analytics here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Volume chart */}
          {barData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Message Volume by Campaign</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={16} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f9fafb' }}
                    itemStyle={{ color: '#d1d5db' }}
                  />
                  <Bar dataKey="Delivered" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Opened" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Clicked" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Failed" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 justify-center">
                {[
                  { label: 'Delivered', color: '#22c55e' },
                  { label: 'Opened', color: '#3b82f6' },
                  { label: 'Clicked', color: '#a855f7' },
                  { label: 'Failed', color: '#ef4444' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                    <span className="text-xs text-gray-400">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rate chart */}
            {rateData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Engagement Rates (%)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rateData} barSize={12} barGap={2}>
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#f9fafb' }}
                      formatter={(val) => [`${val}%`]}
                    />
                    <Bar dataKey="Delivery %" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Open %" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Click %" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie chart */}
            {pieData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Overall Delivery Status</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#d1d5db' }}
                    />
                    <Legend
                      formatter={(val) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Channel breakdown table */}
          {Object.keys(channelBreakdown).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Performance by Channel</h2>
              <div className="space-y-3">
                {Object.entries(channelBreakdown).map(([ch, stats]) => {
                  const delivRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
                  const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
                  return (
                    <div key={ch} className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: CHANNEL_COLORS[ch] || '#6b7280' }}
                      />
                      <span className="text-sm text-gray-300 capitalize w-20">{ch}</span>
                      <div className="flex-1 grid grid-cols-3 gap-3 text-xs text-center">
                        <div>
                          <p className="text-white font-semibold">{stats.sent}</p>
                          <p className="text-gray-500">sent</p>
                        </div>
                        <div>
                          <p className="text-emerald-400 font-semibold">{delivRate.toFixed(0)}%</p>
                          <p className="text-gray-500">delivered</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-semibold">{openRate.toFixed(0)}%</p>
                          <p className="text-gray-500">opened</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campaign table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Campaign Performance Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Campaign', 'Channel', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Failed', 'Del. Rate', 'Open Rate'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs text-gray-400 uppercase tracking-wide font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {completedCampaigns.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium max-w-xs truncate">{c.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded capitalize"
                          style={{ color: CHANNEL_COLORS[c.channel], background: `${CHANNEL_COLORS[c.channel]}20` }}
                        >
                          {c.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.total_sent}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400">{c.delivered}</td>
                      <td className="px-4 py-3 text-sm text-blue-400">{c.opened}</td>
                      <td className="px-4 py-3 text-sm text-violet-400">{c.clicked}</td>
                      <td className="px-4 py-3 text-sm text-red-400">{c.failed}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.delivery_rate.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.open_rate.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {completedCampaigns.length === 0 && (
              <p className="text-center py-8 text-gray-500 text-sm">No campaigns with data yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
