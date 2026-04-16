"use client";

import { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── types ─────────────────────────────────────────────────────────────────────

interface FollowUp {
  label: string;
  question: string;
}

interface ChartSpec {
  type: string;
  x?: string;
  y?: string;
  names?: string;
  values?: string;
  color_col?: string;
  labels?: Record<string, string>;
  columns?: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  follow_ups?: FollowUp[];
  chart_spec?: ChartSpec | null;
  chart_data?: Record<string, unknown>[] | null;
  error?: string | null;
}

// ── suggestion cards shown on empty state ─────────────────────────────────────

const SUGGESTIONS: { icon: string; label: string; question: string }[] = [
  {
    icon: "💰",
    label: "Revenue overview",
    question: "How has our revenue trended over the past year?",
  },
  {
    icon: "📦",
    label: "Top products",
    question: "Which products are generating the most revenue?",
  },
  {
    icon: "🏪",
    label: "Location breakdown",
    question: "Which yard location drives the most revenue?",
  },
  {
    icon: "👷",
    label: "Customer mix",
    question: "What is the split between contractor and retail revenue?",
  },
  {
    icon: "📉",
    label: "Margin issues",
    question: "Which products have the lowest gross margin?",
  },
  {
    icon: "🐌",
    label: "Slow inventory",
    question: "Which inventory items are slow-moving?",
  },
];

// ── colour palette ────────────────────────────────────────────────────────────

const COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") {
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
    if (v % 1 !== 0) return v.toFixed(1);
  }
  return String(v);
};

// ── chart component ───────────────────────────────────────────────────────────

function Chart({ data, spec }: { data: Record<string, unknown>[]; spec: ChartSpec }) {
  if (!data || data.length === 0) return null;

  const xKey = spec.x ?? "";
  const yKey = spec.y ?? "";
  const label = (k: string) => spec.labels?.[k] ?? k.replace(/_/g, " ");

  if (spec.type === "bar") {
    return (
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
            <Tooltip formatter={(v) => fmt(v)} labelFormatter={(l) => String(l)} />
            <Bar dataKey={yKey} fill={COLORS[0]} radius={[3, 3, 0, 0]} name={label(yKey)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "horizontal_bar") {
    return (
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey={yKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Bar dataKey={xKey} fill={COLORS[0]} radius={[0, 3, 3, 0]} name={label(xKey)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "line" || spec.type === "line_multi") {
    const extraKeys = spec.type === "line_multi"
      ? Object.keys(data[0] ?? {}).filter((k) => k !== xKey)
      : [yKey];
    return (
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
            <Tooltip formatter={(v) => fmt(v)} />
            {extraKeys.length > 1 && <Legend />}
            {extraKeys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]}
                dot={false} strokeWidth={2} name={label(k)} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.type === "pie") {
    const nameKey = spec.names ?? xKey;
    const valueKey = spec.values ?? yKey;
    return (
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey}
              cx="50%" cy="50%" outerRadius={88} label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              } labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // scatter and unknown types — fall through to DataTable below
  return null;
}

// ── simple data table for chart_data ─────────────────────────────────────────

function DataTable({
  data,
  spec,
}: {
  data: Record<string, unknown>[];
  spec: ChartSpec;
}) {
  if (!data || data.length === 0) return null;

  // Decide which columns to show
  const allKeys = Object.keys(data[0]);
  const cols =
    spec.columns ??
    (spec.x && spec.y
      ? [spec.x, spec.y, ...(spec.color_col ? [spec.color_col] : [])]
      : allKeys
    ).filter((k) => allKeys.includes(k));

  const label = (col: string) =>
    spec.labels?.[col] ?? col.replace(/_/g, " ");

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-surface-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-1 border-b border-surface-3">
            {cols.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-semibold text-ink-muted capitalize"
              >
                {label(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 12).map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-surface-1"}
            >
              {cols.map((col) => (
                <td key={col} className="px-3 py-2 text-ink-muted">
                  {fmt(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 12 && (
        <p className="px-3 py-2 text-xs text-ink-subtle bg-surface-1 border-t border-surface-3">
          Showing 12 of {data.length} rows
        </p>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function LumberDemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const history = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;
    setError(null);
    setInput("");

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/lumber/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Server error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.text,
        follow_ups: data.follow_ups ?? [],
        chart_spec: data.chart_spec ?? null,
        chart_data: data.chart_data ?? null,
        error: data.error ?? null,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  const lastAssistant = [...messages].reverse().find(
    (m) => m.role === "assistant"
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface-1">
      {/* ── page header ───────────────────────────────────────────────── */}
      <div className="border-b border-surface-3 bg-white">
        <div className="max-w-content mx-auto px-6 py-5 flex items-center gap-3">
          <span className="text-2xl">🪵</span>
          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">
              Lumber AI Analytics
            </h1>
            <p className="text-xs text-ink-muted">
              Consulting demo · Natural language over real business data
            </p>
          </div>
          <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
            Live demo
          </span>
        </div>
      </div>

      {/* ── chat area ─────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-content w-full mx-auto px-6 py-8">

        {/* Empty state — suggestion cards */}
        {messages.length === 0 && !loading && (
          <div className="text-center mb-10">
            <p className="text-2xl font-semibold text-ink mb-2">
              What&apos;s happening in the business?
            </p>
            <p className="text-sm text-ink-muted mb-8">
              Ask anything about revenue, products, customers, or inventory.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUGGESTIONS.map(({ icon, label, question }) => (
                <button
                  key={label}
                  onClick={() => sendQuestion(question)}
                  className="flex items-center gap-2.5 p-3.5 bg-white border border-surface-3 rounded-xl text-left text-sm font-medium text-ink hover:border-accent hover:shadow-sm transition-all"
                >
                  <span className="text-lg shrink-0">{icon}</span>
                  <span className="text-ink-muted">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                /* User bubble — right aligned */
                <div className="flex justify-end">
                  <div className="max-w-lg bg-accent text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* Assistant response — left aligned */
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center text-sm">
                    🪵
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-surface-3 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-ink leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Chart — falls back to table for 'table' type or unrecognised specs */}
                    {msg.chart_data && msg.chart_spec && (
                      <>
                        <Chart data={msg.chart_data} spec={msg.chart_spec} />
                        {["table", "scatter"].includes(msg.chart_spec.type) && (
                          <DataTable data={msg.chart_data} spec={msg.chart_spec} />
                        )}
                      </>
                    )}

                    {/* Error note — friendly, no raw internals */}
                    {msg.error && (
                      <p className="mt-2 text-xs text-ink-muted italic">
                        {msg.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full bg-surface-2 border border-surface-3 flex items-center justify-center text-sm">
                🪵
              </div>
              <div className="bg-white border border-surface-3 rounded-2xl rounded-tl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Follow-up chips */}
        {lastAssistant?.follow_ups && lastAssistant.follow_ups.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 mt-6">
            {lastAssistant.follow_ups.map(({ label, question }) => (
              <button
                key={label}
                onClick={() => sendQuestion(question)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-surface-3 bg-white text-ink-muted hover:border-accent hover:text-accent transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* API error banner — shown when the request itself fails (network, 5xx) */}
        {error && (
          <div className="mt-4 p-3 bg-surface-2 border border-surface-3 rounded-lg text-sm text-ink-muted">
            Something went wrong — please try again in a moment.
          </div>
        )}
      </div>

      {/* ── input bar ─────────────────────────────────────────────────── */}
      <div className="border-t border-surface-3 bg-white sticky bottom-0">
        <div className="max-w-content mx-auto px-6 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion(input);
            }}
            className="flex gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your business..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent focus:bg-white transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Ask
            </button>
          </form>
          <p className="text-xs text-ink-subtle mt-2 text-center">
            Demo data · 4,000+ orders · 4 yard locations · Jan 2024 – Mar 2025
          </p>
        </div>
      </div>
    </div>
  );
}
