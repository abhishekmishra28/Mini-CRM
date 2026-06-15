import { useState } from 'react';
import { Plus, Trash2, Users, Sparkles, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useSegments } from '../hooks/useSegments';
import { aiApi } from '../services/api/ai.api';
import { segmentsApi } from '../services/api/segments.api';
import type { SegmentCondition, SegmentOperator, ConditionField, ConditionOp } from '../types';

const FIELD_OPTIONS: { value: ConditionField; label: string }[] = [
  { value: 'total_spent', label: 'Total Spent (₹)' },
  { value: 'order_count', label: 'Order Count' },
  { value: 'last_order_date', label: 'Last Order Date' },
  { value: 'first_order_date', label: 'First Order Date' },
  { value: 'city', label: 'City' },
  { value: 'tags', label: 'Tag' },
];

const OP_OPTIONS: Record<string, { value: ConditionOp; label: string }[]> = {
  total_spent: [
    { value: 'gt', label: 'greater than' },
    { value: 'lt', label: 'less than' },
    { value: 'gte', label: 'at least' },
    { value: 'lte', label: 'at most' },
    { value: 'eq', label: 'exactly' },
  ],
  order_count: [
    { value: 'gt', label: 'more than' },
    { value: 'lt', label: 'less than' },
    { value: 'gte', label: 'at least' },
    { value: 'lte', label: 'at most' },
    { value: 'eq', label: 'exactly' },
  ],
  last_order_date: [
    { value: 'days_ago_gt', label: 'more than N days ago' },
    { value: 'days_ago_lt', label: 'within last N days' },
  ],
  first_order_date: [
    { value: 'days_ago_gt', label: 'more than N days ago' },
    { value: 'days_ago_lt', label: 'within last N days' },
  ],
  city: [
    { value: 'eq', label: 'is' },
    { value: 'neq', label: 'is not' },
    { value: 'contains', label: 'contains' },
  ],
  tags: [{ value: 'contains', label: 'includes' }],
};

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function ConditionRow({
  condition,
  onChange,
  onRemove,
}: {
  condition: SegmentCondition;
  onChange: (c: SegmentCondition) => void;
  onRemove: () => void;
}) {
  const ops = OP_OPTIONS[condition.field] || [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Field */}
      <select
        value={condition.field}
        onChange={(e) => {
          const field = e.target.value as ConditionField;
          const defaultOp = (OP_OPTIONS[field]?.[0]?.value || 'eq') as ConditionOp;
          onChange({ ...condition, field, op: defaultOp, value: '' });
        }}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
      >
        {FIELD_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Operator */}
      <select
        value={condition.op}
        onChange={(e) => onChange({ ...condition, op: e.target.value as ConditionOp })}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
      >
        {ops.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Value */}
      <input
        type={condition.field === 'city' || condition.field === 'tags' ? 'text' : 'number'}
        value={condition.value}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        placeholder={
          condition.field === 'city' ? 'e.g. Mumbai' :
          condition.field === 'tags' ? 'e.g. vip' :
          condition.field.includes('date') ? 'days' : 'amount'
        }
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-32 focus:outline-none focus:border-violet-500"
      />

      <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors p-1">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function Segments() {
  const { segments, loading, createSegment, deleteSegment } = useSegments();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<SegmentCondition[]>([
    { id: uuid(), field: 'total_spent', op: 'gte', value: '' },
  ]);
  const [operator, setOperator] = useState<SegmentOperator>('AND');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  function addCondition() {
    setConditions([...conditions, { id: uuid(), field: 'total_spent', op: 'gte', value: '' }]);
    setPreviewCount(null);
  }

  function removeCondition(id: string) {
    setConditions(conditions.filter((c) => c.id !== id));
    setPreviewCount(null);
  }

  function updateCondition(id: string, updated: SegmentCondition) {
    setConditions(conditions.map((c) => (c.id === id ? updated : c)));
    setPreviewCount(null);
  }

  async function preview() {
    const seg = { name: name || 'Preview', description, conditions, operator };
    try {
      const customers = await segmentsApi.preview(seg);
      setPreviewCount(customers.length);
    } catch (e) {
      console.error(e);
      setPreviewCount(0);
    }
  }

  async function save() {
    if (!name.trim() || conditions.length === 0) return;
    await createSegment({ name: name.trim(), description, conditions, operator });
    resetForm();
  }

  function resetForm() {
    setName('');
    setDescription('');
    setConditions([{ id: uuid(), field: 'total_spent', op: 'gte', value: '' }]);
    setOperator('AND');
    setPreviewCount(null);
    setShowCreate(false);
    setAiPrompt('');
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await aiApi.generateSegment(aiPrompt);
      setName(result.name);
      setDescription(result.description);
      setOperator(result.operator);
      setConditions(
        result.conditions.map((c: any) => ({
          id: uuid(),
          field: c.field as ConditionField,
          op: c.op as ConditionOp,
          value: c.value,
        })),
      );
    } catch(err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Segments</h1>
          <p className="text-gray-400 text-sm mt-1">Build audiences from your shopper data</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Segment
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <Filter size={16} className="text-violet-400" />
            Create Segment
          </h2>

          {/* AI Builder */}
          <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-medium">
              <Sparkles size={14} />
              AI Segment Builder
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                    placeholder="e.g. customers who spent over ₹10,000 but haven't ordered in 90 days"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate
              </button>
            </div>
            <p className="text-xs text-violet-400/60">Describe your target audience in plain English — AI will build the conditions</p>
          </div>

          {/* Name & Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">Segment Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. High-Value Lapsed"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Operator toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Match:</span>
            {(['AND', 'OR'] as SegmentOperator[]).map((op) => (
              <button
                key={op}
                onClick={() => setOperator(op)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  operator === op
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {op === 'AND' ? 'ALL conditions' : 'ANY condition'}
              </button>
            ))}
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Conditions</label>
            {conditions.map((cond) => (
              <ConditionRow
                key={cond.id}
                condition={cond}
                onChange={(updated) => updateCondition(cond.id, updated)}
                onRemove={() => removeCondition(cond.id)}
              />
            ))}
            <button
              onClick={addCondition}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
            >
              <Plus size={12} /> Add condition
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={preview}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <Users size={14} />
              Preview audience
            </button>
            {previewCount !== null && (
              <span className="text-sm text-violet-300 font-medium">
                {previewCount} customers match
              </span>
            )}
            <div className="flex-1" />
            <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-300">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!name.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Segment
            </button>
          </div>
        </div>
      )}

      {/* Segments list */}
      {loading ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
           <Loader2 size={40} className="animate-spin text-violet-500 mx-auto mb-3" />
           <p className="text-gray-400 font-medium">Loading segments...</p>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <Filter size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No segments yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first audience segment to start targeting shoppers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((seg) => {
            const isExpanded = expanded === seg.id;
            return (
              <div key={seg.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : seg.id)}
                >
                  <div className="p-2 bg-violet-600/20 rounded-lg">
                    <Filter size={16} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium text-sm">{seg.name}</h3>
                      {seg.ai_generated && (
                        <span className="px-1.5 py-0.5 bg-violet-600/20 text-violet-300 text-xs rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> AI
                        </span>
                      )}
                    </div>
                    {seg.description && (
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{seg.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-white font-semibold">{seg.customer_count}</p>
                      <p className="text-gray-500 text-xs">customers</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                      {seg.operator}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSegment(seg.id); }}
                      className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {seg.conditions.map((cond, idx) => (
                        <span key={cond.id} className="flex items-center gap-1">
                          {idx > 0 && (
                            <span className="text-xs text-gray-500 px-1">{seg.operator}</span>
                          )}
                          <span className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">
                            <span className="text-gray-400">{cond.field}</span>{' '}
                            <span className="text-violet-400">{cond.op}</span>{' '}
                            <span className="text-white font-medium">{cond.value}</span>
                          </span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Created {new Date(seg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
