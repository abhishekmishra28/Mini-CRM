import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Filter, Megaphone } from 'lucide-react';
import { useSegments } from '../hooks/useSegments';
import { useCampaigns } from '../hooks/useCampaigns';
import { useDashboard } from '../hooks/useDashboard';
import { aiApi } from '../services/api/ai.api';
import type { ChatMessage, SegmentCondition, ConditionField, ConditionOp } from '../types';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

const SUGGESTIONS = [
  'Who are my most valuable customers?',
  'Create a segment for shoppers who haven\'t bought in 60 days',
  'Which channel has the best open rate?',
  'Draft a WhatsApp message for lapsed customers',
  'What campaigns should I run this month?',
  'Identify customers at risk of churning',
];

export function AIAssistant() {
  const { segments, createSegment } = useSegments();
  const { campaigns } = useCampaigns();
  const { analytics } = useDashboard();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuid(),
      role: 'assistant',
      content: "Hi! I'm Xeno AI, your intelligent marketing assistant 👋\n\nI can help you:\n• **Segment your shoppers** — describe your audience in plain English\n• **Draft campaign messages** — personalised copy for any channel\n• **Analyse performance** — understand what's working and what isn't\n\nWhat would you like to do today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        totalCustomers: analytics?.total_customers || 0,
        totalCampaigns: analytics?.total_campaigns || 0,
        totalRevenue: analytics?.total_revenue || 0,
        recentCampaigns: campaigns.slice(-3).map((c) => c.name),
      };

      const result = await aiApi.chat(msg, context);

      const assistantMsg: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toISOString(),
        action: result.action as ChatMessage['action'],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Handle AI actions
      if (result.action?.type === 'create_segment') {
        await handleAICreateSegment(msg);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: 'assistant',
          content: 'Sorry, I hit a snag. Please try again in a moment.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAICreateSegment(prompt: string) {
    try {
      const result = await aiApi.generateSegment(prompt);
      const conditions: SegmentCondition[] = result.conditions.map((c: any) => ({
        id: uuid(),
        field: c.field as ConditionField,
        op: c.op as ConditionOp,
        value: c.value,
      }));

      const seg = await createSegment({
        name: result.name,
        description: result.description,
        conditions,
        operator: result.operator,
        ai_generated: true,
      });

      const count = seg.customer_count;

      setMessages((prev) => [
        ...prev,
        {
          id: uuid(),
          role: 'assistant',
          content: `✅ I've created the segment **"${result.name}"** with ${count} matching customers.\n\n${result.reasoning}\n\nYou can find it in the Segments page. Ready to create a campaign for this audience?`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setActionFeedback(`Segment "${result.name}" created (${count} customers)`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error('Segment creation error:', err);
    }
  }

  async function handleQuickAction(type: 'segment' | 'campaign') {
    if (type === 'segment') {
      handleSend('Create a segment for high-value customers who spent over ₹15,000');
    } else {
      handleSend('Help me plan a re-engagement campaign for lapsed customers');
    }
  }

  function formatMessage(text: string) {
    // Simple markdown-like formatting
    return text
      .split('\n')
      .map((line, i) => {
        // Bold text
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line === '' ? 'h-3' : 'leading-relaxed'}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{part}</strong> : part,
            )}
          </p>
        );
      });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center">
            <Bot size={18} className="text-violet-300" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">Xeno AI Assistant</h1>
            <p className="text-gray-400 text-xs">Powered by Gemini • Segment, message, and analyse in natural language</p>
          </div>
          {actionFeedback && (
            <div className="ml-auto px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-1.5">
              <Sparkles size={12} />
              {actionFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-6 py-3 border-b border-gray-800 flex items-center gap-2">
        <span className="text-xs text-gray-500">Quick:</span>
        <button
          onClick={() => handleQuickAction('segment')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 text-xs rounded-lg border border-violet-600/20 transition-colors"
        >
          <Filter size={11} /> Auto-Segment
        </button>
        <button
          onClick={() => handleQuickAction('campaign')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs rounded-lg border border-blue-600/20 transition-colors"
        >
          <Megaphone size={11} /> Plan Campaign
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-600">
          {analytics?.total_customers || 0} customers · {segments.length} segments · {campaigns.length} campaigns
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-violet-600/30'
                  : 'bg-gray-700'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Bot size={15} className="text-violet-300" />
              ) : (
                <User size={15} className="text-gray-300" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm'
              }`}
            >
              <div className="space-y-1">{formatMessage(msg.content)}</div>
              <p className="text-xs opacity-40 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center">
              <Bot size={15} className="text-violet-300" />
            </div>
            <div className="bg-gray-800 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 hover:border-violet-600/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-violet-500 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about your shoppers, segments, or campaigns..."
              rows={2}
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
