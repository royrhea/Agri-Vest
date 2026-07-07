"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChevronRight,
  Droplet,
  CheckCircle2,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import NavBar from "../navbar";

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ---------- Section label — the small dash + eyebrow used throughout ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-px w-4 bg-neutral-900" />
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-900">{children}</p>
    </div>
  );
}

/* ---------- Mock data (swap for real account / API data) ---------- */

const STATS = [
  { label: "Total portfolio value", value: "$124,500.00", delta: "+4.2%", positive: true, sub: "Combined across 5 active assets" },
  { label: "YTD total returns", value: "$12,480.00", delta: "+12.1%", positive: true, sub: "Realized and unrealized gains" },
  { label: "Liquid capital", value: "$18,200.00", delta: null, sub: "Available for immediate deployment" },
];

// 12 months of mock portfolio value. 6M/1Y/ALL slice this same series —
// in production, ALL would instead fetch the full account history.
const GROWTH = [
  { month: "Jan", value: 28000 },
  { month: "Feb", value: 30500 },
  { month: "Mar", value: 45200 },
  { month: "Apr", value: 47000 },
  { month: "May", value: 60400 },
  { month: "Jun", value: 62100 },
  { month: "Jul", value: 85300 },
  { month: "Aug", value: 95800 },
  { month: "Sep", value: 104200 },
  { month: "Oct", value: 112600 },
  { month: "Nov", value: 118900 },
  { month: "Dec", value: 124500 },
];

const RANGES: Record<string, number> = { "6M": 6, "1Y": 12, ALL: 12 };

const INVESTMENTS = [
  { name: "Sutherland Organic Wheat", meta: "Crop · $74,200 invested", roi: "8.2%", health: "Optimal" as const },
  { name: "Oasis Avocado Grove", meta: "Orchard · $30,900 invested", roi: "12.4%", health: "Optimal" as const },
  { name: "Blue Ridge Dairy Co.", meta: "Livestock · $84,900 invested", roi: "6.8%", health: "Warning" as const },
  { name: "Prairie Solar Farm", meta: "Solar · $70,900 invested", roi: "9.5%", health: "Optimal" as const },
  { name: "Emerald Vineyards", meta: "Vineyard · $9,900 invested", roi: "11.1%", health: "Optimal" as const },
];

const ALERTS = [
  { icon: Droplet, title: "Low soil moisture: Block A", sub: "Sutherland Wheat", tone: "warning" as const },
  { icon: CheckCircle2, title: "Quarterly payout processed", sub: "Oasis Avocado Grove", tone: "good" as const },
  { icon: Wifi, title: "New telemetry node online", sub: "Blue Ridge Dairy Co.", tone: "neutral" as const },
];

const TRANSACTIONS = [
  { date: "Oct 24", label: "Quarterly Dividend – Oasis Avocado", amount: 1240, positive: true },
  { date: "Oct 18", label: "Initial Stake – Emerald Vineyards", amount: -9500, positive: false },
  { date: "Oct 08", label: "System Service Fee", amount: -45, positive: false },
];

const UPCOMING = [
  { title: "Sutherland Wheat – Harvest Payout", date: "Nov 15 · Projected", amount: "$2,400.00" },
  { title: "Blue Ridge Dairy – Yield Payment", date: "Nov 01 · Locked", amount: "$1,850.00" },
];

const HEALTH_STYLES: Record<string, string> = {
  Optimal: "bg-[#eaf6c8] text-[#4a5a12]",
  Warning: "bg-amber-100 text-amber-700",
};

const ALERT_STYLES: Record<string, string> = {
  warning: "bg-amber-100 text-amber-700",
  good: "bg-[#eaf6c8] text-[#4a5a12]",
  neutral: "bg-neutral-100 text-neutral-600",
};

function formatAmount(n: number) {
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function PortfolioDashboard() {
  const [range, setRange] = useState<"6M" | "1Y" | "ALL">("1Y");
  const chartData = GROWTH.slice(-RANGES[range]);

  return (
     <div className="min-h-screen bg-[#b8cb8a] px-6 pb-20 font-sans md:px-14 ">
      <NavBar/>
     

      <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10 ">
        {/* Stat cards */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-3 border-2 border-[#a4c358] bg-white/20 p-6 rounded-2xl">
          {STATS.map(({ label, value, delta, positive, sub }) => (
            <motion.div key={label} variants={fadeUp} className="rounded-2xl border border-[#a4c358] bg-white/50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-neutral-900">{value}</p>
                {delta && (
                  <span className={`flex items-center text-xs font-bold ${positive ? "text-[#5c7a0f]" : "text-red-600"}`}>
                    {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {delta}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">{sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Portfolio growth chart */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mt-8 rounded-2xl border-2 border-[#bccd91] bg-white/80 p-5 md:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <SectionLabel>Portfolio growth</SectionLabel>
              <p className="mt-1.5 text-sm text-neutral-500">Historical value trend across all farmland investments</p>
            </div>
            <div className="flex gap-1 rounded-full bg-neutral-100 p-1">
              {(["6M", "1Y", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition border-2 border-[#c4d598]  ${
                    range === r ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-64 w-full border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8e639" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c8e639" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9a9a9a" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9a9a9a" }}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v?: number) => [(v !== undefined ? `$${v.toLocaleString()}` : ""), "Portfolio value"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                />
                <Area type="stepAfter" dataKey="value" stroke="#3f4a10" strokeWidth={2} fill="url(#growthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Active investments + right rail */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr] border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl"
          >
            <SectionLabel>Active investments</SectionLabel>
            <p className="mt-1.5 text-sm text-neutral-500">Managing 5 distinct agricultural assets</p>

            <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.3fr] gap-2 border-b border-neutral-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                <span>Asset name</span>
                <span>ROI</span>
                <span>Health</span>
                <span></span>
              </div>
              {INVESTMENTS.map(({ name, meta, roi, health }) => (
                <button
                  key={name}
                  className="grid w-full grid-cols-[1.6fr_0.6fr_0.7fr_0.3fr] items-center gap-2 border-b border-neutral-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-neutral-50"
                >
                  <span>
                    <p className="text-sm font-bold text-neutral-900">{name}</p>
                    <p className="text-xs text-neutral-500">{meta}</p>
                  </span>
                  <span className="text-sm font-bold text-neutral-900">{roi}</span>
                  <span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${HEALTH_STYLES[health]}`}>{health}</span>
                  </span>
                  <ChevronRight size={16} className="justify-self-end text-neutral-400" />
                </button>
              ))}
            </div>

            <a href="/marketplace" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 hover:underline">
              View marketplace to expand portfolio <ChevronRight size={14} />
            </a>
          </motion.section>

          <div className="flex flex-col gap-8 ">
            {/* Critical alerts */}
            <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: easeOut }} className="border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
              <SectionLabel>Critical alerts</SectionLabel>
              <div className="mt-4 flex flex-col gap-2.5">
                {ALERTS.map(({ icon: Icon, title, sub, tone }) => (
                  <div key={title} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ALERT_STYLES[tone]}`}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{title}</p>
                      <p className="text-xs text-neutral-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Market spotlight */}
            <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: easeOut }} className="border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
              <SectionLabel>Market spotlight</SectionLabel>
              <div className="mt-4 overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-white">
                <div className="relative flex h-32 items-center justify-center bg-neutral-100">
                  <span className="absolute left-3 top-3 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-bold uppercase text-white">New</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-bold uppercase tracking-tight text-neutral-900">Canyon Ridge Orchards</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                    Premium citrus orchard with newly installed smart irrigation and a 14% projected ROI.
                  </p>
                  <button className="mt-3 w-full rounded-full bg-neutral-900 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800">
                    Analyze asset
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Transaction history + upcoming payouts */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 ">
          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: easeOut }} className="border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
            <SectionLabel>Transaction history</SectionLabel>
            <p className="mt-1.5 text-sm text-neutral-500">Latest movements in your capital account</p>
            <div className="mt-4 flex flex-col">
              {TRANSACTIONS.map(({ date, label, amount, positive }) => (
                <div key={label + date} className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="w-11 text-xs font-medium text-neutral-400">{date}</span>
                    <span className="text-sm font-medium text-neutral-800">{label}</span>
                  </div>
                  <span className={`text-sm font-bold ${positive ? "text-[#5c7a0f]" : "text-neutral-900"}`}>
                    {formatAmount(amount)}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: easeOut }} className="border-2 border-[#a4c358] bg-white/50 p-6 rounded-xl">
            <SectionLabel>Upcoming payouts</SectionLabel>
            <p className="mt-1.5 text-sm text-neutral-500">Projected cash flow schedule for Q4</p>
            <div className="mt-4 flex flex-col">
              {UPCOMING.map(({ title, date, amount }) => (
                <div key={title} className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{title}</p>
                    <p className="text-xs text-neutral-400">{date}</p>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">{amount}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}