// export default function Docs() {
//   return (
//     <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
//       <h1 className="text-4xl text-[#05d9e8] mb-6">API Documentation</h1>

//       <div className="space-y-6">
//         <div>
//           <h2 className="text-[#ff2a6d]">POST /api/incidents</h2>
//           <p className="text-white/60">Create new incident</p>
//         </div>

//         <div>
//           <h2 className="text-[#ff2a6d]">GET /api/incidents/my</h2>
//           <p className="text-white/60">Get user tickets</p>
//         </div>

//         <div>
//           <h2 className="text-[#ff2a6d]">PUT /api/incidents/:id/status</h2>
//           <p className="text-white/60">Update ticket status</p>
//         </div>

//         <div>
//           <h2 className="text-[#ff2a6d]">GET /api/incidents/predict-sla-risk</h2>
//           <p className="text-white/60">Predict SLA risk</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Copy, 
  ChevronRight, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Menu, 
  X 
} from 'lucide-react';

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/incidents',
    description: 'Create a new system incident report.',
    params: { title: 'string', description: 'string', priority: 'high | medium | low' },
    response: '{ id: "inc_123", status: "created" }'
  },
  {
    method: 'GET',
    path: '/api/incidents/my',
    description: 'Retrieve a list of tickets created by the authenticated user.',
    params: { limit: 'number', offset: 'number' },
    response: '[{ id: "inc_123", ... }]'
  },
  {
    method: 'PUT',
    path: '/api/incidents/:id/status',
    description: 'Update the resolution status of a specific ticket.',
    params: { status: 'resolved | closed | pending' },
    response: '{ success: true }'
  },
  {
    method: 'GET',
    path: '/api/incidents/predict-sla-risk',
    description: 'AI-driven analysis to predict potential SLA breaches.',
    params: { timeframe: '24h | 7d' },
    response: '{ risk_score: 0.85, breach_probability: "high" }'
  }
];

const SidebarItem = ({ label, active }) => (
  <div className={`px-4 py-2 cursor-pointer transition-colors ${active ? 'text-[#05d9e8] bg-[#05d9e8]/10' : 'text-white/40 hover:text-white/80'}`}>
    {label}
  </div>
);

export default function Docs() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEndpoints = API_ENDPOINTS.filter(ep => 
    ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ep.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020205] text-gray-200 font-sans selection:bg-[#ff2a6d]/30">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#020205]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#05d9e8] rounded flex items-center justify-center">
            <Terminal className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-[#05d9e8] tracking-tighter">NEXUS_API</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#05050a] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 hidden lg:flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#05d9e8] rounded flex items-center justify-center">
              <Terminal className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-[#05d9e8] tracking-tighter text-xl">NEXUS_API</span>
          </div>

          <nav className="mt-4 space-y-1">
            <div className="px-6 text-xs font-semibold text-white/20 uppercase tracking-widest mb-2">Introduction</div>
            <SidebarItem label="Getting Started" active />
            <SidebarItem label="Authentication" />
            <SidebarItem label="Errors" />
            
            <div className="px-6 text-xs font-semibold text-white/20 uppercase tracking-widest mt-8 mb-2">Endpoints</div>
            {API_ENDPOINTS.map((ep, i) => (
              <SidebarItem key={i} label={ep.path} />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 md:px-10 py-12 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              API <span className="text-[#05d9e8]">Documentation</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl">
              Integrate our next-gen incident management engine into your existing workflow. 
              Secure, blazing fast, and AI-optimized.
            </p>

            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search endpoints..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[#ff2a6d]/50 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          <div className="space-y-16">
            <AnimatePresence mode='popLayout'>
              {filteredEndpoints.map((ep, idx) => (
                <motion.section 
                  key={ep.path}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest border ${ 
                          ep.method === 'POST' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {ep.method}
                        </span>
                        <h2 className="text-xl md:text-2xl font-mono font-bold text-[#ff2a6d] truncate">
                          {ep.path}
                        </h2>
                      </div>
                      
                      <p className="text-white/60 mb-6">{ep.description}</p>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Parameters</h4>
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-white/40 text-xs">
                              <tr>
                                <th className="px-4 py-2 font-medium">Field</th>
                                <th className="px-4 py-2 font-medium">Type</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {Object.entries(ep.params).map(([key, val]) => (
                                <tr key={key}>
                                  <td className="px-4 py-2 font-mono text-[#05d9e8]">{key}</td>
                                  <td className="px-4 py-2 text-white/40">{val}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="bg-[#0a0a12] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                          <span className="text-xs font-mono text-white/40">Response Body</span>
                          <button className="hover:text-[#05d9e8] transition-colors">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-4">
                          <pre className="text-sm font-mono text-white/80 overflow-x-auto">
                            <code>{ep.response}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>

          <footer className="mt-24 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            &copy; 2024 NEXUS SYSTEMS INC. ALL RIGHTS RESERVED. SECURED BY QUANTUM_ENCRYPTION.
          </footer>
        </main>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff2a6d] opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#05d9e8] opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>
    </div>
  );
}
