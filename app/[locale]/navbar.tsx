"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/HomePage" },
  { label: "Explore Farmland", href: "/Explore" },
  { label: "Investor", href: "/Investor" },
  { label: "Farmers", href: "/Farmers" },
  { label: "About Us", href: "/About" },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function NavBar() {
  const [active, setActive] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      className="relative flex items-center justify-between py-7 z-30"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900"
      >
        <span className="text-[#c8e639]">AGRI |</span> VIST
      </Link>

      {/* Desktop nav */}
      <nav className="hidden gap-10 text-sm font-medium text-neutral-900 md:flex">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setActive(label)}
            className="relative pb-1"
          >
            <motion.span whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              {label}
            </motion.span>
            {active === label && (
              <motion.div
                layoutId="nav-underline"
                className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-neutral-900"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>

      <motion.button
        className="hidden rounded-full border border-neutral-800 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white md:block"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        Login|register
      </motion.button>

      {/* Mobile hamburger */}
      <button
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-900 md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="absolute left-0 right-0 top-full z-40 overflow-hidden rounded-2xl bg-white shadow-lg md:hidden"
          >
            <motion.div
              className="flex flex-col gap-1 p-4"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
              }}
              initial="hidden"
              animate="show"
            >
              {NAV_LINKS.map(({ label, href }) => (
                <motion.div
                  key={label}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
                  }}
                >
                  <Link
                    href={href}
                    onClick={() => {
                      setActive(label);
                      setMobileOpen(false);
                    }}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active === label
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
                }}
                className="mt-2 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
              >
                Login|register
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}