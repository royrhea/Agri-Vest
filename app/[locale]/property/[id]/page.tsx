"use client";
import React, { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/app/[locale]/Footer";
import NavBar from "../../navbar";
import {
  MapPin,
  Share2,
  Bookmark,
  ArrowUpRight,
  ArrowRight,
  Droplets,
  Wind,
  Thermometer,
  Sprout,
  Tractor,
  Sun,
  Wheat,
  X,
  Activity,
  BarChart3,
  Percent,
} from "lucide-react";

// Shared Mock Data from Explore Page
const FARMLANDS = [
  {
    id: "sundance-corn-estate",
    name: "Sundance Corn Estate",
    location: "Nebraska, USA",
    image: "/farm.jpg",
    yield: "12.4%",
    risk: "Low",
    minInvestment: "$500",
    tech: ["AI Irrigation", "Autonomous Tractors"],
    cropType: "Corn",
    rotationDays: 120,
    trending: true,
    fundedPct: 82,
    totalGoal: "$2.3M",
    zone: "Zone 4b",
    description: "Sundance Corn Estate spans 438 hectares of prime corn-belt farmland in Nebraska, run with precision irrigation and autonomous farming equipment. The farm has consistently outperformed regional yield benchmarks for six consecutive seasons.",
    projectedPayout: "$742,000",
  },
  {
    id: "blue-ridge-orchard",
    name: "Blue Ridge Apple Orchard",
    location: "Virginia, USA",
    image: "/farm.jpg",
    yield: "14.1%",
    risk: "Medium",
    minInvestment: "$1,000",
    tech: ["Drone Scouting", "Soil Sensors"],
    cropType: "Apples",
    rotationDays: 365,
    trending: true,
    fundedPct: 65,
    totalGoal: "$1.5M",
    zone: "Zone 6a",
    description: "Located in the heart of Virginia, this orchard utilizes drone scouting and soil sensors to ensure the highest quality apples while maintaining environmentally sustainable practices.",
    projectedPayout: "$450,000",
  },
  {
    id: "golden-wheat-coop",
    name: "Golden Wheat Co-operative",
    location: "Kansas, USA",
    image: "/farm.jpg",
    yield: "10.5%",
    risk: "Low",
    minInvestment: "$250",
    tech: ["Satellite Imaging", "Predictive Weather"],
    cropType: "Wheat",
    rotationDays: 90,
    trending: false,
    fundedPct: 95,
    totalGoal: "$4.0M",
    zone: "Zone 5b",
    description: "A large-scale co-operative in Kansas focusing on high-volume wheat production. Advanced satellite imaging and predictive weather modeling secure consistent yields year over year.",
    projectedPayout: "$1,200,000",
  },
  {
    id: "emerald-vineyards",
    name: "Emerald Vineyards",
    location: "California, USA",
    image: "/farm.jpg",
    yield: "16.8%",
    risk: "High",
    minInvestment: "$5,000",
    tech: ["Smart Drip", "Robotic Harvesting"],
    cropType: "Grapes",
    rotationDays: 180,
    trending: true,
    fundedPct: 40,
    totalGoal: "$8.5M",
    zone: "Zone 9b",
    description: "Emerald Vineyards is a premium wine grape producing property in California. With robotic harvesting and smart drip irrigation, it aims for luxury wine markets.",
    projectedPayout: "$2,800,000",
  },
  {
    id: "dakota-soy-fields",
    name: "Dakota Soy Fields",
    location: "South Dakota, USA",
    image: "/farm.jpg",
    yield: "11.2%",
    risk: "Medium",
    minInvestment: "$500",
    tech: ["Variable Rate Tech", "AI Irrigation"],
    cropType: "Soybeans",
    rotationDays: 110,
    trending: false,
    fundedPct: 15,
    totalGoal: "$3.2M",
    zone: "Zone 4a",
    description: "These vast soy fields utilize variable rate technology to optimize inputs across varied soil types, ensuring cost efficiency and strong crop health.",
    projectedPayout: "$980,000",
  }
];

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/* ---------- Telemetry data (mock — swap for live sensor feed) ---------- */
const TELEMETRY = [
  { label: "Soil moisture", value: "32.4%", delta: "+1.8% today", icon: Droplets },
  { label: "Air quality index", value: "8.2", delta: "Good · steady", icon: Wind },
  { label: "Soil temperature", value: "18.2°C", delta: "+0.4° today", icon: Thermometer },
];

const MOISTURE_TREND = [22, 26, 24, 29, 31, 28, 33, 30, 34, 32, 35, 32.4];
const TELEMETRY_TRENDS: Record<string, number[]> = {
  "Soil moisture": [22, 26, 24, 29, 31, 28, 33, 30, 34, 32, 35, 32.4],
  "Air quality index": [7.1, 7.4, 7.2, 7.8, 8.0, 7.6, 8.3, 8.1, 7.9, 8.2, 8.0, 8.2],
  "Soil temperature": [15.8, 16.2, 16.9, 17.1, 16.7, 17.4, 17.8, 17.5, 18.0, 17.8, 18.1, 18.2],
};

const RISK_FACTORS = [
  { label: "Weather volatility", level: "Low", pct: 25 },
  { label: "Market liquidity", level: "Medium", pct: 55 },
  { label: "Operator track record", level: "Strong", pct: 90 },
];

const TIMELINE = [
  {
    title: "Land preparation",
    desc: "Soil enrichment and irrigation upgrades completed.",
    date: "Mar 2026",
    status: "done",
  },
  {
    title: "Spring planting",
    desc: "Seeds sown across the entire property.",
    date: "Apr 2026",
    status: "done",
  },
  {
    title: "Growth monitoring",
    desc: "Active — tracked via satellite and ground sensors.",
    date: "Now",
    status: "active",
  },
  {
    title: "Mid-season treatment",
    desc: "Nutrient application and pest control administered.",
    date: "Jul 2026",
    status: "upcoming",
  },
  {
    title: "Fall harvest",
    desc: "Projected yield collection and sale to buyers.",
    date: "Oct 2026",
    status: "upcoming",
  },
];

function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  const w = 100;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#c8e639" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatDivider() {
  return <div className="hidden h-10 w-px bg-neutral-200 md:block" />;
}

export default function PropertyDetail({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const resolvedParams = use(params);
  const propertyId = resolvedParams.id;
  const locale = resolvedParams.locale;

  const property = FARMLANDS.find(f => f.id === propertyId) || FARMLANDS[0];
  const similarFarms = FARMLANDS.filter(f => f.id !== propertyId).slice(0, 3);
  
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#b8cb8a] px-6 pb-20 font-sans md:px-14 ">
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
      >
        <Image
          src="/bga.jpg"
          alt=""
          fill
          priority
          className="object-cover object-bottom opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8c8c81]/50 via-[#749a86] to via-[#374f42] " />
      </motion.div>
      <style jsx global>{`
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(200, 230, 57, 0.55); }
          100% { box-shadow: 0 0 0 10px rgba(200, 230, 57, 0); }
        }
        @keyframes livedot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .pulse-ring { animation: pulseRing 2s ease-out infinite; }
        .live-dot { animation: livedot 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pulse-ring, .live-dot { animation: none; }
        }
      `}</style>
      
      <div className="relative z-10">
        <NavBar />
        
        <div className="mx-auto max-w-[1200px] pt-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-700"
          >
            <Link href={`/${locale}/Explore`} className="hover:text-neutral-900 bg-white/20 px-2 py-1 rounded-md transition-colors">Catalog</Link>
            <ArrowRight size={12} />
            <Link href={`/${locale}/Explore?location=${property.location.split(',')[0]}`} className="hover:text-neutral-900 bg-white/20 px-2 py-1 rounded-md transition-colors">{property.location}</Link>
            <ArrowRight size={12} />
            <span className="text-neutral-900 bg-white/40 px-2 py-1 rounded-md font-bold">{property.name}</span>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="relative h-[340px] w-full overflow-hidden rounded-3xl md:h-[420px] shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            <div className="absolute right-5 top-5 flex gap-2 z-20">
              <button aria-label="Share property" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8e639] border-2 border-[#212224] text-neutral-900 transition hover:bg-white hover:scale-105 active:scale-95 shadow-lg">
                <Share2 size={16} />
              </button>
              <button aria-label="Save property" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8e639] border-2 border-[#212122] text-neutral-900 transition hover:bg-white hover:scale-105 active:scale-95 shadow-lg">
                <Bookmark size={16} />
              </button>
            </div>
            
            <Image src={property.image} alt={property.name} fill priority className="object-cover border-2 border-[#c8e639] z-0" />
                  
            <div className="mb-6 absolute left-5 top-[250px] md:top-[330px] z-20 flex bg-[#c8e639] border-2 border-[#212224] text-neutral-900 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide shadow-lg">
               <p className="flex items-center gap-1.5 text-sm font-bold">
                <MapPin size={16} /> {property.location} · {property.zone}
              </p>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 text-white z-20 pointer-events-none">
              <h1 className="p-2 px-4 rounded-2xl text-4xl md:text-6xl font-extrabold uppercase leading-[0.95] tracking-tight drop-shadow-md border-b-4 border-[#c8e639] inline-block mt-3 bg-black/30 backdrop-blur-sm">
                {property.name}
              </h1>
            </div>
          </motion.div>

          {/* Stat bar */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative z-20 -mt-6 mx-2 flex flex-col gap-6 rounded-3xl bg-white/90 backdrop-blur-md p-6 border-2 border-[#c8e639] shadow-2xl md:mx-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 md:flex md:flex-1 md:items-center">
              {[
                ["Target yield", property.yield],
                ["Risk rating", property.risk],
                ["Funding goal", property.totalGoal],
                ["Funded", property.fundedPct + "%"],
                ["Min investment", property.minInvestment],
              ].map(([label, value], i) => (
                <motion.div key={label} variants={fadeUp} className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</p>
                    <p className="text-2xl font-extrabold text-[#374f42]">{value}</p>
                  </div>
                  {i < 4 && <StatDivider />}
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="flex items-center justify-between gap-6 border-t border-neutral-200 pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Projected payout</p>
                <p className="text-xl font-extrabold text-[#374f42]">{property.projectedPayout} <span className="text-sm font-medium text-neutral-500">/ 20 yr</span></p>
              </div>
              <motion.button onClick={() => setIsTradeModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="whitespace-nowrap rounded-2xl bg-[#1b2620] px-8 py-3 text-sm border-2 border-transparent font-bold text-[#c8e639] transition hover:bg-black hover:border-[#c8e639] shadow-lg">
                Invest Now
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Live field telemetry */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="md:mt-24 mt-12 rounded-3xl bg-white/60 backdrop-blur-md p-6 border-2 border-white/50 shadow-xl md:p-8 z-20 relative"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07] flex items-center gap-2"><Tractor size={18}/> Live field telemetry</h2>
              <div className="flex items-center gap-2 rounded-full border-2 border-[#c8e639] bg-gray-900 text-[#c8e639] px-4 py-2 text-xs font-bold shadow-md">
                <span className="live-dot h-2 w-2 rounded-full bg-[#c8e639]" />
                Updated 4s ago
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3 ">
              {TELEMETRY.map(({ label, value, delta, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-white/80 p-6 border-2 border-transparent hover:border-[#c8e639] transition-colors shadow-sm">
                  <div className="flex items-center justify-between bg-amber-50/80 rounded-lg px-3 py-2 border border-amber-100">
                    <Icon size={18} className="text-[#a8c718]" />
                    <Sparkline data={TELEMETRY_TRENDS[label]} className="h-8 w-20 "  />
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-[#2a3307]">{value}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#67780f] mt-1">{label} · {delta}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-white/80 border-2 border-transparent hover:border-[#c8e639] transition-colors shadow-sm p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#313a04]">24h soil moisture trend</p>
                <p className="text-lg font-extrabold text-[#a0bd0f]">32.4%</p>
              </div>
              <Sparkline data={MOISTURE_TREND} className="mt-4 h-20 w-full" />
              <div className="mt-2 flex justify-between text-xs font-semibold text-neutral-400">
                <span>–24h</span><span>–12h</span><span>now</span>
              </div>
            </div>
          </motion.section>

          {/* Greedy Index & Weekly Comparison */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-20 relative"
          >
            {/* Greedy Index */}
            <div className="rounded-3xl bg-white/60 backdrop-blur-md p-6 border-2 border-white/50 shadow-xl md:p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07] mb-2">Greedy Index</h2>
                <p className="text-xs font-medium text-[#67780f] mb-6">Market sentiment based on local agriculture trends, demand, and yield projections.</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold text-[#2a3307] mb-2">78</div>
                <div className="text-sm font-bold uppercase tracking-widest text-[#a0bd0f] mb-6">Greed (Strong Buy)</div>
                
                {/* Gradient Bar representing the index */}
                <div className="w-full relative">
                  <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-[#c8e639] shadow-inner"></div>
                  {/* Pointer positioned at 78% */}
                  <div className="absolute top-1/2 left-[78%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[3px] border-[#343d07] rounded-full shadow-md"></div>
                </div>
                <div className="w-full flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-3">
                  <span>Extreme Fear</span>
                  <span>Neutral</span>
                  <span>Extreme Greed</span>
                </div>
              </div>
            </div>

            {/* Weekly Comparison */}
            <div className="rounded-3xl bg-white/60 backdrop-blur-md p-6 border-2 border-white/50 shadow-xl md:p-8">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07] mb-6">Technical Breakdown (WoW)</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm transition hover:border-[#c8e639]">
                  <span className="text-sm font-bold text-[#343d07]">Soil Quality Score</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 line-through">82%</span>
                    <span className="text-sm font-extrabold text-[#a0bd0f] bg-[#c8e639]/20 px-2 py-1 rounded-md">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm transition hover:border-[#c8e639]">
                  <span className="text-sm font-bold text-[#343d07]">Est. Yield Growth</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 line-through">+1.2%</span>
                    <span className="text-sm font-extrabold text-[#a0bd0f] bg-[#c8e639]/20 px-2 py-1 rounded-md">+2.1%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm transition hover:border-[#c8e639]">
                  <span className="text-sm font-bold text-[#343d07]">Market Demand Index</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">High</span>
                    <ArrowRight size={14} className="text-neutral-300"/>
                    <span className="text-sm font-extrabold text-[#a0bd0f] bg-[#c8e639]/20 px-2 py-1 rounded-md">Very High</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Farm profile + Investment timeline */} 
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1.0fr_0.9fr] h-full ">
            {/* Farm profile */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="rounded-3xl border-2 border-white/50 shadow-xl bg-white/60 backdrop-blur-md p-6 md:p-8"
            >
              <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07]">Farm profile</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-[#3f4a10] font-medium">
                {property.description}
              </p>
  
              <h3 className="mt-10 text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07]">Risk analysis</h3>
              <div className="mt-5 flex flex-col gap-6">
                {RISK_FACTORS.map(({ label, level, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-bold text-[#3f4a10]">{label}</span>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#67780f]">{level}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: easeOut }}
                        className="h-full rounded-full bg-gradient-to-r from-[#8da514] to-[#c8e639]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
  
            {/* Investment timeline */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="rounded-3xl border-2 border-white/50 shadow-xl bg-white/60 backdrop-blur-md p-6 md:p-8 flex flex-col"
            >
              <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#343d07]">Investment timeline</h2>
              <div className="relative mt-6 flex flex-col gap-8 pl-2 flex-grow">
                <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-[#879f11]/30" />
                {TIMELINE.map(({ title, desc, date, status }) => (
                  <div key={title} className="relative flex gap-5 pl-6">
                    <span
                      className={`absolute left-[-2px] top-1.5 h-4 w-4 rounded-full border-[3px] shadow-sm ${
                        status === "active"
                          ? "pulse-ring border-[#c8e639] bg-[#8da514]"
                          : status === "done"
                          ? "border-[#343d07] bg-[#343d07]"
                          : "border-white bg-[#e0e8cd]"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-[13px] font-extrabold uppercase tracking-wider text-[#2a3307]">{title}</p>
                        <span className="whitespace-nowrap text-[11px] font-bold text-[#67780f] bg-white/50 px-2 py-0.5 rounded-md">{date}</span>
                      </div>
                      <p className="text-sm text-[#3f4a10] font-medium leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Investor insights */}
              <div className="mt-8 rounded-2xl border-2 border-white/40 bg-white/80 p-6 shadow-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#343d07]">Investor insights</p>
                <dl className="mt-4 grid grid-cols-2 gap-y-4 text-sm">
                  <dt className="text-[#67780f] font-bold">Sponsor</dt>
                  <dd className="text-right font-extrabold text-[#2a3307]">Plains Harvest LLC</dd>
                  <dt className="text-[#67780f] font-bold">Tax form</dt>
                  <dd className="text-right font-extrabold text-[#2a3307]">1099</dd>
                  <dt className="text-[#67780f] font-bold">Structure</dt>
                  <dd className="text-right font-extrabold text-[#2a3307]">Direct with sponsor</dd>
                  <dt className="text-[#67780f] font-bold">Payout</dt>
                  <dd className="text-right font-extrabold text-[#2a3307]">Annual, after harvest</dd>
                </dl>
                <Link href={`/prospectus/${property.id}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-[#343d07] hover:text-black hover:underline transition-colors group">
                  View full prospectus <ArrowUpRight size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Similar opportunities */}
          <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: easeOut }} className="mt-16 bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/40 pb-5 mb-6">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.15em] text-[#2a3307]">Similar opportunities</h2>
              <Link href={`/${locale}/Explore`} className="flex items-center gap-1.5 text-sm font-extrabold text-[#2a3307] hover:text-black hover:underline transition-colors group">
                View all properties <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {similarFarms.map((sim) => (
                <Link href={`/${locale}/property/${sim.id}`} key={sim.name}>
                  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl border-2 border-transparent hover:border-[#c8e639] transition-all cursor-pointer group">
                    <div className="flex h-32 items-center justify-center bg-[#1f2e14] relative overflow-hidden">
                      <Image src={sim.image} alt={sim.name} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                      <Sprout size={36} className="text-[#c8e639] relative z-10 drop-shadow-md" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold uppercase tracking-tight text-neutral-900 leading-tight mb-1">{sim.name}</p>
                          <p className="text-xs font-bold text-neutral-500">{sim.location}</p>
                        </div>
                        <span className="whitespace-nowrap rounded-lg bg-[#c8e639]/20 border border-[#c8e639]/30 px-2.5 py-1 text-xs font-extrabold text-[#526107]">{sim.yield}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>

        </div>
        <div className="mt-12">
          <Footer/>
        </div>
      </div>

      {/* Trade Details Modal */}
      <AnimatePresence>
        {isTradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsTradeModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#f7f9f2] rounded-[2rem] shadow-2xl overflow-hidden border border-[#c8e639]/30"
            >
              <div className="bg-[#1b2620] text-white px-8 py-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8e639]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2 relative z-10">
                  <Activity className="text-[#c8e639]" /> Trade Execution Details
                </h2>
                <button onClick={() => setIsTradeModalOpen(false)} className="text-white/60 hover:text-white transition-colors relative z-10">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Greedy Index */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#67780f] mb-3 flex items-center gap-1.5"><BarChart3 size={14}/> Greedy Index</h3>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-extrabold text-[#2a3307]">78</span>
                      <span className="text-sm font-bold text-[#c8e639] bg-[#1b2620] px-2 py-0.5 rounded-md mb-1">Strong Buy</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-[#c8e639] mt-3 relative">
                      <div className="absolute top-1/2 left-[78%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1b2620] rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  {/* Expected ROI */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[#67780f] mb-3 flex items-center gap-1.5"><Percent size={14}/> Expected ROI</h3>
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold text-[#2a3307]">14.5% - 17.2%</span>
                      <span className="text-xs font-bold text-neutral-500 mt-1">Target Annualized Return (IRR)</span>
                    </div>
                  </div>
                </div>

                {/* Technical Crop Yield Details */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#2a3307] mb-4 border-b border-gray-100 pb-2">Probable Crop Yield Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[#f7f9f2] p-3 rounded-xl border border-[#e0e8cd]">
                      <span className="block text-[10px] font-bold uppercase text-[#67780f] mb-1">Yield Proj.</span>
                      <span className="text-lg font-extrabold text-[#2a3307]">210 bu/ac</span>
                    </div>
                    <div className="bg-[#f7f9f2] p-3 rounded-xl border border-[#e0e8cd]">
                      <span className="block text-[10px] font-bold uppercase text-[#67780f] mb-1">NPK Sensor</span>
                      <span className="text-sm font-extrabold text-[#2a3307]">Optimal Base</span>
                    </div>
                    <div className="bg-[#f7f9f2] p-3 rounded-xl border border-[#e0e8cd]">
                      <span className="block text-[10px] font-bold uppercase text-[#67780f] mb-1">Moisture</span>
                      <span className="text-sm font-extrabold text-[#2a3307]">32.4% (Ideal)</span>
                    </div>
                    <div className="bg-[#f7f9f2] p-3 rounded-xl border border-[#e0e8cd]">
                      <span className="block text-[10px] font-bold uppercase text-[#67780f] mb-1">Light Index</span>
                      <span className="text-sm font-extrabold text-[#2a3307]">94% (High)</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    * Advanced spectral imaging and ground NPK sensors indicate soil conditions are highly favorable. Combined with active moisture management and strong solar indices, this asset's biological yield probability remains in the top 5th percentile of the region.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button onClick={() => setIsTradeModalOpen(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button className="flex-[2] py-3.5 px-4 rounded-xl font-extrabold text-[#1b2620] bg-[#c8e639] hover:bg-[#a8c718] transition-colors shadow-lg hover:shadow-xl">
                    Confirm Investment Allocation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
