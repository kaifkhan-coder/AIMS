import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Mail, ShieldCheck, LifeBuoy, Terminal } from 'lucide-react';

const faqs = [
  {
    q: "Ticket not updating?",
    a: "Our system syncs every 60 seconds. If you don't see immediate changes, try a hard refresh (Ctrl+F5) or re-authenticate your session. If the issue persists, check the system status page."
  },
  {
    q: "Not receiving notifications?",
    a: "Ensure your email address is verified in settings. Additionally, check your spam folder and whitelist our domain @support-net.io. Push notifications can be toggled in the dashboard interface."
  },
  {
    q: "Unable to login?",
    a: "First, attempt a password reset via the 'Forgot Password' link. If you have 2FA enabled and lost access to your device, please contact your system administrator for a manual recovery token."
  },
  {
    q: "API Rate Limiting?",
    a: "Standard accounts are limited to 100 requests per minute. If you require higher throughput, please upgrade to our Enterprise tier or optimize your batch processing logic."
  }
];

const SupportItem = ({ faq, isOpen, toggle, index }) => {
  return (
    <div className="mb-4 overflow-hidden border border-[#05d9e8]/20 bg-[#0a0a0f] rounded-lg transition-all duration-300 hover:border-[#05d9e8]/50">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <span className="text-[#05d9e8] font-mono text-sm">0{index + 1}</span>
          <span className={`font-medium transition-colors duration-300 ${isOpen ? 'text-[#ff2a6d]' : 'text-gray-200'}`}>
            {faq.q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-[#ff2a6d]' : 'text-[#05d9e8]'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 pt-0">
              <div className="h-px w-full bg-gradient-to-r from-[#05d9e8]/30 to-transparent mb-4" />
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Support() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans selection:bg-[#ff2a6d]/30">
      {/* Grid Background Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header Section */}
        <header className="mb-16 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#05d9e8]/30 bg-[#05d9e8]/5 text-[#05d9e8] text-xs font-mono mb-6 uppercase tracking-widest"
          >
            <Terminal className="w-3 h-3" />
            System_Diagnostic_Running
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] via-white to-[#ff2a6d] mb-4 tracking-tighter"
          >
            SUPPORT_NET
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-xl"
          >
            Access our knowledge base or connect with technical operatives to resolve infrastructure anomalies.
          </motion.p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <h2 className="text-[#ff2a6d] font-mono text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <LifeBuoy className="w-4 h-4" /> Common_Resolutions
            </h2>
            {faqs.map((item, i) => (
              <SupportItem 
                key={i} 
                faq={item} 
                index={i}
                isOpen={openIndex === i} 
                toggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>

          {/* Sidebar Cards */}
          <aside className="space-y-6">
            <div className="p-6 rounded-xl border border-[#ff2a6d]/20 bg-[#ff2a6d]/5 backdrop-blur-sm">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#ff2a6d]" /> Live Chat
              </h3>
              <p className="text-sm text-gray-400 mb-4">Average response time: &lt; 2 minutes</p>
              <button className="w-full py-2 bg-[#ff2a6d] hover:bg-[#ff2a6d]/80 text-white font-bold rounded transition-colors text-sm">
                INITIALIZE_CHAT
              </button>
            </div>

            <div className="p-6 rounded-xl border border-[#05d9e8]/20 bg-[#05d9e8]/5 backdrop-blur-sm">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#05d9e8]" /> Email Support
              </h3>
              <p className="text-sm text-gray-400 mb-4">For complex architectural inquiries.</p>
              <button className="w-full py-2 border border-[#05d9e8] text-[#05d9e8] hover:bg-[#05d9e8]/10 font-bold rounded transition-colors text-sm">
                SEND_TICKET
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-400 font-mono">Security Protocol v2.4 Active</span>
            </div>
          </aside>
        </div>

        {/* Footer Glow */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-[#05d9e8]/10 blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
}