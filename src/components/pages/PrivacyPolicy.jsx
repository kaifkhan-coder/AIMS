import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, Database, Bell, UserCheck, RefreshCw, ChevronRight, Menu, X } from 'lucide-react';

const Section = ({ icon: Icon, title, children, id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="mb-12 relative group"
  >
    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff2a6d] to-transparent opacity-50 group-hover:opacity-100 transition-opacity hidden md:block" />
    <div className="flex items-center gap-4 mb-4">
      <div className="p-2 rounded-lg bg-[#ff2a6d]/10 border border-[#ff2a6d]/30 text-[#ff2a6d]">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-[#ff2a6d] uppercase font-mono">
        {title}
      </h2>
    </div>
    <div className="pl-0 md:pl-10 text-white/70 leading-relaxed text-lg border-l border-white/5 md:border-none">
      {children}
    </div>
  </motion.section>
);

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    { id: 'collection', title: '1. Data Collection', icon: Database },
    { id: 'usage', title: '2. Data Usage', icon: Eye },
    { id: 'security', title: '3. Security Measures', icon: Shield },
    { id: 'cookies', title: '4. Cookies & Tracking', icon: Lock },
    { id: 'rights', title: '5. User Rights', icon: UserCheck },
    { id: 'updates', title: '6. Updates', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-[#05d9e8] selection:text-black font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#05d9e8]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff2a6d]/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-50 bg-[#020205]/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <span className="text-[#05d9e8] font-mono font-bold tracking-widest">AIMS // PRIVACY</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className={`
          lg:w-72 fixed lg:sticky top-24 h-fit z-40 transition-all duration-300
          ${isSidebarOpen ? 'left-0 right-0 bottom-0 bg-[#020205] p-8 pt-24' : '-left-full lg:left-0'}
        `}>
          <nav className="space-y-2">
            <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em] mb-6">Protocol Navigation</p>
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 p-3 rounded-md transition-all hover:bg-white/5 text-white/60 hover:text-[#05d9e8] group border border-transparent hover:border-[#05d9e8]/20"
              >
                <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{item.title.split('. ')[1]}</span>
              </a>
            ))}
          </nav>
          
          <div className="mt-12 p-4 rounded-xl border border-[#05d9e8]/20 bg-[#05d9e8]/5 hidden lg:block">
            <p className="text-xs text-[#05d9e8] font-mono leading-relaxed">
              SYSTEM STATUS: SECURE<br />
              ENCRYPTION: AES-256<br />
              PROTOCOL: V4.2.0
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-3 py-1 rounded-full border border-[#05d9e8]/30 bg-[#05d9e8]/10 text-[#05d9e8] text-xs font-mono mb-6 uppercase tracking-widest">
              Legal Protocol // 2024
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-8 text-[#05d9e8] uppercase tracking-tighter">
              Protocol <br />
              <span className="text-white">Privacy Policy</span>
            </h1>
            <p className="text-xl text-white/80 mb-16 leading-relaxed border-l-4 border-[#05d9e8] pl-6 italic">
              Your data security is mission-critical. This Privacy Policy explains how
              the Automated Incident Management System (AIMS) collects, uses, and protects your data within the neural network.
            </p>
          </motion.div>

          <Section id="collection" icon={Database} title="1. Data Collection">
            <p>We collect essential telemetry and user information including:</p>
            <ul className="mt-4 space-y-2 list-none">
              {['User identification (Name, ID, Role)', 'Communication metadata (Email, Logs)', 'Incident-related data streams', 'System interaction diagnostics'].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#05d9e8]" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="usage" icon={Eye} title="2. Data Usage">
            <p>Your data is processed for high-level ticket tracking, real-time notifications, predictive analytics, and core system optimizations.</p>
            <p className="mt-4 p-4 bg-white/5 rounded border border-white/10">
              <span className="text-[#05d9e8] font-bold">ZERO-SHARE POLICY:</span> We do not sell, trade, or distribute your personal data to external third-party entities.
            </p>
          </Section>

          <Section id="security" icon={Shield} title="3. Security Measures">
            <p>AIMS employs military-grade encryption protocols (AES-256), multi-factor authentication, and strictly enforced role-based access control (RBAC) to ensure your data remains isolated from unauthorized access.</p>
          </Section>

          <Section id="cookies" icon={Lock} title="4. Cookies & Tracking">
            <p>We utilize minimal persistent tracking technologies to maintain session integrity, user preferences, and performance benchmarking. No marketing or cross-site tracking cookies are deployed.</p>
          </Section>

          <Section id="rights" icon={UserCheck} title="5. User Rights">
            <p>You retain full sovereignty over your data. Users may request access, modification, or complete purging of their data records by contacting the system administrators through the secure terminal.</p>
          </Section>

          <Section id="updates" icon={RefreshCw} title="6. Updates">
            <p>This policy is subject to periodic iteration. Continued system access following update deployment constitutes acceptance of modified terms. Last updated: {new Date().toLocaleDateString()}.</p>
          </Section>

          <footer className="mt-24 pt-12 border-t border-white/10 text-white/40 text-sm font-mono flex flex-col md:flex-row justify-between gap-4">
            <div>© 2026 AIMS. ALL RIGHTS RESERVED.</div>
          </footer>
        </main>
      </div>
    </div>
  );
}
