import { useState } from 'react';
import {
  Plus, Send, Trash2, Megaphone, Sparkles, Loader2,
  CheckCircle, Clock, AlertCircle, MessageSquare,
} from 'lucide-react';
import { useCampaigns, useCampaignCommunications } from '../hooks/useCampaigns';
import { useSegments } from '../hooks/useSegments';
import { aiApi } from '../services/api/ai.api';
import type { CampaignChannel, Campaign } from '../types';

const CHANNELS: { value: CampaignChannel; label: string; color: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', color: 'text-green-400 bg-green-400/10 border-green-400/30', icon: '💬' },
  { value: 'sms', label: 'SMS', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: '📱' },
  { value: 'email', label: 'Email', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30', icon: '📧' },
  { value: 'rcs', label: 'RCS', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30', icon: '✨' },
];

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const map = {
    draft: 'text-gray-400 bg-gray-400/10',
    sending: 'text-amber-400 bg-amber-400/10',
    sent: 'text-blue-400 bg-blue-400/10',
    completed: 'text-emerald-400 bg-emerald-400/10',
  };
  const icons = {
    draft: <Clock size={10} />,
    sending: <Loader2 size={10} className="animate-spin" />,
    sent: <Send size={10} />,
    completed: <CheckCircle size={10} />,
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${map[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function CampaignDetailModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { communications: comms } = useCampaignCommunications(campaign.id);
  const channel = CHANNELS.find((c) => c.value === campaign.channel);

  const deliveryRate = campaign.total_sent > 0 ? (campaign.delivered / campaign.total_sent) * 100 : 0;
  const openRate = campaign.delivered > 0 ? (campaign.opened / campaign.delivered) * 100 : 0;
  const clickRate = campaign.opened > 0 ? (campaign.clicked / campaign.opened) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${channel?.color}`}>
                  {channel?.icon} {channel?.label}
                </span>
                <StatusBadge status={campaign.status} />
              </div>
              <h2 className="text-white font-semibold text-lg">{campaign.name}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Message preview */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Message</p>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{campaign.message}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Sent', value: campaign.total_sent, color: 'text-white' },
              { label: 'Delivered', value: campaign.delivered, sub: `${deliveryRate.toFixed(0)}%`, color: 'text-emerald-400' },
              { label: 'Opened', value: campaign.opened, sub: `${openRate.toFixed(0)}%`, color: 'text-blue-400' },
              { label: 'Clicked', value: campaign.clicked, sub: `${clickRate.toFixed(0)}%`, color: 'text-violet-400' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Communication log */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              Delivery Log ({comms.length} messages)
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {comms.slice(0, 20).map((comm) => (
                <div key={comm.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-gray-300">
                        {comm.customer_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-300">{comm.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {comm.status === 'clicked' && <span className="text-xs text-violet-400">🖱 clicked</span>}
                    {comm.status === 'opened' && <span className="text-xs text-blue-400">👁 opened</span>}
                    {comm.status === 'delivered' && <span className="text-xs text-emerald-400">✓ delivered</span>}
                    {comm.status === 'failed' && <span className="text-xs text-red-400">✕ failed</span>}
                    {(comm.status === 'queued' || comm.status === 'sent') && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> queued
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {comms.length > 20 && (
                <p className="text-xs text-gray-600 text-center pt-1">
                  and {comms.length - 20} more...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Campaigns() {
  const { campaigns, loading, createCampaign, sendCampaign, deleteCampaign } = useCampaigns();
  const { segments } = useSegments();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('whatsapp');
  const [message, setMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const selectedSegment = segments.find((s) => s.id === segmentId);

  async function handleAiGenerateCampaign() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await aiApi.generateCampaign(aiPrompt, segments.map(s => ({ id: s.id, name: s.name })));
      setName(result.name);
      setSegmentId(result.segmentId);
      if (['whatsapp', 'sms', 'email', 'rcs'].includes(result.channel)) {
        setChannel(result.channel as CampaignChannel);
      }
      setMessage(result.message);
    } catch(err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleGenerateMessage() {
    if (!segmentId) return;
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg) return;
    setAiLoading(true);
    try {
      const prompt = `Segment: ${seg.name}. Description: ${seg.description || 'Target audience'}. Channel: ${channel}. Write a marketing message under 150 characters.`;
      const msg = await aiApi.generateMessage(prompt);
      setMessage(msg);
    } catch(err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSend(campaignId: string) {
    setSending(campaignId);
    try {
      await sendCampaign(campaignId);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(null);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !segmentId || !message.trim()) return;
    await createCampaign({
      name: name.trim(),
      segment_id: segmentId,
      segment_name: selectedSegment?.name,
      channel,
      message: message.trim(),
      ai_generated_message: false,
    });
    setName('');
    setSegmentId('');
    setMessage('');
    setAiPrompt('');
    setShowCreate(false);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-gray-400 text-sm mt-1">Dispatch personalised messages to your audiences</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <Megaphone size={16} className="text-violet-400" />
            Create Campaign
          </h2>

          {/* AI Builder */}
          <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4 space-y-3 mb-2">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-medium">
              <Sparkles size={14} />
              AI Campaign Builder
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerateCampaign()}
                placeholder="e.g. Create a WhatsApp summer sale campaign for high spenders offering 20% off"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleAiGenerateCampaign}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate
              </button>
            </div>
            <p className="text-xs text-violet-400/60">Describe your campaign in plain English — AI will select the segment and draft the message</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">Campaign Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Win-back Summer Sale"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Segment */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">Target Segment *</label>
            {segments.length === 0 ? (
              <p className="text-sm text-amber-400 bg-amber-400/10 px-3 py-2 rounded-lg">
                No segments yet — create one in the Segments page first.
              </p>
            ) : (
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">Select a segment...</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.customer_count} customers)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Channel */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">Channel *</label>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => setChannel(ch.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${
                    channel === ch.value
                      ? ch.color
                      : 'text-gray-500 bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {ch.icon} {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Message *</label>
              <button
                onClick={handleGenerateMessage}
                disabled={aiLoading || !segmentId}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Write
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your ${channel} message... or use AI Write`}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">{message.length} characters</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !segmentId || !message.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </div>
      )}

      {/* Campaigns list */}
      {loading ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
           <Loader2 size={40} className="animate-spin text-violet-500 mx-auto mb-3" />
           <p className="text-gray-400 font-medium">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <Megaphone size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No campaigns yet</p>
          <p className="text-gray-600 text-sm mt-1">Create a campaign to start reaching your shoppers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.slice().reverse().map((camp) => {
            const ch = CHANNELS.find((c) => c.value === camp.channel);
            const deliveryRate = camp.total_sent > 0 ? (camp.delivered / camp.total_sent) * 100 : 0;
            const isSending = sending === camp.id || camp.status === 'sending';

            return (
              <div key={camp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelected(camp)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${ch?.color}`}>
                        {ch?.icon} {ch?.label}
                      </span>
                      <StatusBadge status={camp.status} />
                      {camp.ai_generated_message && (
                        <span className="px-1.5 py-0.5 bg-violet-600/20 text-violet-300 text-xs rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> AI
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium">{camp.name}</h3>
                    {camp.segment_name && (
                      <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                        <MessageSquare size={10} />
                        {camp.segment_name}
                      </p>
                    )}

                    {/* Stats */}
                    {camp.total_sent > 0 && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-400">
                          <span className="text-white font-medium">{camp.total_sent}</span> sent
                        </span>
                        <span className="text-xs text-emerald-400">
                          {camp.delivered} delivered ({deliveryRate.toFixed(0)}%)
                        </span>
                        <span className="text-xs text-blue-400">{camp.opened} opened</span>
                        <span className="text-xs text-violet-400">{camp.clicked} clicked</span>
                        {camp.failed > 0 && (
                          <span className="text-xs text-red-400">{camp.failed} failed</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {camp.status === 'draft' && (
                      <button
                        onClick={() => handleSend(camp.id)}
                        disabled={isSending}
                        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {isSending ? (
                          <><Loader2 size={12} className="animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={12} /> Send</>
                        )}
                      </button>
                    )}
                    {camp.status === 'sending' && (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-400/10 text-amber-400 text-xs rounded-lg">
                        <Loader2 size={12} className="animate-spin" /> Delivering...
                      </div>
                    )}
                    {camp.status === 'completed' && (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-400/10 text-emerald-400 text-xs rounded-lg">
                        <CheckCircle size={12} /> Completed
                      </div>
                    )}
                    <button
                      onClick={() => deleteCampaign(camp.id)}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Delivery progress bar */}
                {camp.status === 'sending' && camp.total_sent > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Delivering messages...</span>
                      <span>{camp.delivered + camp.failed}/{camp.total_sent}</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${((camp.delivered + camp.failed) / camp.total_sent) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <CampaignDetailModal campaign={selected} onClose={() => setSelected(null)} />
      )}

      {/* Info note */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          <strong className="text-gray-300">Channel Service Simulation:</strong> When you send a campaign, 
          messages are dispatched to a simulated channel service. Delivery receipts (delivered, opened, clicked, failed) 
          arrive asynchronously via callbacks — just like real WhatsApp/SMS/Email providers work. Watch the stats update in real-time.
        </p>
      </div>
    </div>
  );
}
