import React from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
const Footer = () => {
  return (
    <footer className="mt-20 grid grid-cols-2 gap-8 border-t border-neutral-900/40 pt-10 text-sm sm:grid-cols-4 z-10 bg-amber-50/50 p-8">
          {[
            ["Company", ["About", "Careers", "Press", "Contact"]],
            ["Marketplace", ["Browse farms", "Sell land", "Yield reports"]],
            ["Resources", ["Investor FAQ", "Fund passbook", "Compliance"]],
            ["Support", ["Help center", "Live chat", "System status"]],
          ].map(([heading, links]) => (
            <div key={heading as string}>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">{heading as string}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {(links as string[]).map((link) => (
                  <li key={link}>
                    <Link href="#" className="flex items-center gap-1.5 text-neutral-700 hover:text-neutral-900">
                      {link === "Live chat" && <MessageCircle size={13} />}
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </footer>
  )
}

export default Footer