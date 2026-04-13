// // import React from "react";
// // import { Link } from "react-router-dom";
// // import { motion, useScroll, useTransform } from "framer-motion";
// // import { 
// //   ShieldCheck, Activity, Clock, ArrowRight, LogIn, UserPlus, AlertCircle, Search, Bell
// // } from "lucide-react";

// // // --- Mocking LiveSystemStatus for standalone execution ---
// // // In a real environment, this would be imported from "./LiveSystemStatus.jsx"
// // const LiveSystemStatus = () => (
// //   <div className="flex items-center gap-2">
// //     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
// //     <span className="text-xs font-medium text-emerald-400">Systems Operational</span>
// //   </div>
// // );

// // // --- Grid Background with animated blobs ---
// // const GridBackground = () => (
// //   <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
// //     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
// //     <motion.div 
// //       className="absolute left-[-10%] top-[-10%] h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] rounded-full bg-blue-500/20 blur-[80px] sm:blur-[120px]"
// //       animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
// //       transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
// //     />
// //     <motion.div 
// //       className="absolute right-[-10%] bottom-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-indigo-500/10 blur-[80px] sm:blur-[150px]"
// //       animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
// //       transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
// //     />
// //   </div>
// // );

// // // --- 2D Dashboard Mockup ---
// // const DashboardMockup = () => {
// //   return (
// //     <div className="relative w-full flex items-center justify-center py-10 sm:py-0">
// //       <motion.div
// //         initial={{ opacity: 0, y: 20 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.8, ease: "easeOut" }}
// //         className="relative w-full max-w-[500px] aspect-[4/3] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-blue-900/20 flex flex-col"
// //       >
// //         {/* Dashboard Header */}
// //         <div className="h-10 sm:h-12 border-b border-slate-700/50 flex items-center px-3 sm:px-4 justify-between shrink-0">
// //           <div className="flex gap-1.5 sm:gap-2">
// //             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/50" />
// //             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/50" />
// //             <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/50" />
// //           </div>
// //           <div className="flex gap-2 sm:gap-3 text-slate-500">
// //             <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
// //             <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
// //           </div>
// //         </div>

// //         {/* Dashboard Body */}
// //         <div className="p-3 sm:p-4 grid grid-cols-12 gap-3 sm:gap-4 flex-1 overflow-hidden">
// //           {/* Sidebar */}
// //           <div className="col-span-3 flex flex-col gap-2 sm:gap-3 border-r border-slate-700/30 pr-2">
// //             {[1, 2, 3, 4].map(i => (
// //               <motion.div 
// //                 key={i}
// //                 className="h-1.5 sm:h-2 w-full bg-slate-700/30 rounded-full"
// //                 initial={{ x: -10, opacity: 0 }}
// //                 animate={{ x: 0, opacity: 1 }}
// //                 transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
// //               />
// //             ))}
// //           </div>

// //           {/* Main Content */}
// //           <div className="col-span-9 flex flex-col gap-3 sm:gap-4">
// //             {/* Stats Row */}
// //             <div className="grid grid-cols-3 gap-2 sm:gap-3">
// //               {[1, 2, 3].map(i => (
// //                 <motion.div 
// //                   key={i} 
// //                   className="h-12 sm:h-16 bg-slate-800/50 rounded-lg border border-slate-700/30 p-2 flex flex-col justify-center"
// //                   initial={{ y: 10, opacity: 0 }}
// //                   animate={{ y: 0, opacity: 1 }}
// //                   transition={{ type: "spring", stiffness: 120, damping: 15, delay: i * 0.2 }}
// //                 >
// //                   <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-500/20 rounded mb-1.5 sm:mb-2" />
// //                   <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-slate-600/30 rounded" />
// //                 </motion.div>
// //               ))}
// //             </div>

// //             {/* Chart Area */}
// //             <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/30 relative overflow-hidden group">
// //               <div className="absolute bottom-0 left-0 right-0 h-[70%] flex items-end justify-around px-1 sm:px-2 pb-1 sm:pb-2 gap-0.5 sm:gap-1">
// //                 {[40, 70, 50, 90, 60, 80, 45, 70].map((h, i) => (
// //                   <motion.div 
// //                     key={i}
// //                     initial={{ height: 0 }}
// //                     animate={{ height: `${h}%` }}
// //                     transition={{ duration: 1, delay: 0.5 + i * 0.1, type: "spring", stiffness: 100 }}
// //                     className="w-full bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors"
// //                   />
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Floating Alert Cards */}
// //         <motion.div 
// //           animate={{ y: [0, -8, 0] }}
// //           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
// //           className="absolute -right-2 sm:-right-6 -top-4 sm:-top-6 bg-slate-800 p-2 sm:p-4 rounded-xl border border-slate-600 shadow-xl flex items-center gap-2 sm:gap-3 z-10 scale-90 sm:scale-100"
// //         >
// //           <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg">
// //             <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
// //           </div>
// //           <div>
// //             <div className="text-[10px] sm:text-xs text-slate-400">Critical Alert</div>
// //             <div className="text-xs sm:text-sm font-bold text-white">Server Down</div>
// //           </div>
// //         </motion.div>

// //         <motion.div 
// //           animate={{ y: [0, -5, 0] }}
// //           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
// //           className="absolute -left-2 sm:-left-4 bottom-4 sm:bottom-10 bg-slate-800 p-2 sm:p-3 rounded-xl border border-slate-600 shadow-xl flex items-center gap-2 sm:gap-3 z-10 scale-90 sm:scale-100"
// //         >
// //             <LiveSystemStatus/>
// //         </motion.div>

// //       </motion.div>
// //     </div>
// //   );
// // };

// // // --- Main Page Component ---

// // const containerVariants = {
// //   hidden: { opacity: 0 },
// //   visible: {
// //     opacity: 1,
// //     transition: { staggerChildren: 0.1, delayChildren: 0.2 },
// //   },
// // };

// // const itemVariants = {
// //   hidden: { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
// //   visible: { 
// //     opacity: 1, 
// //     y: 0,
// //     scale: 1,
// //     filter: "blur(0px)",
// //     transition: { duration: 0.8, ease: "easeOut" }
// //   },
// // };

// // const features = [
// //   {
// //     title: "Incident Tracking",
// //     desc: "Track every issue from creation to resolution with live status updates.",
// //     icon: <Activity className="w-5 h-5 text-blue-400" />,
// //     gradient: "from-blue-500/10 to-cyan-500/10",
// //   },
// //   {
// //     title: "Role Based Access",
// //     desc: "Separate dashboards and permissions for Users, Staff, Admins, and Super Admin.",
// //     icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
// //     gradient: "from-emerald-500/10 to-teal-500/10",
// //   },
// //   {
// //     title: "SLA Monitoring",
// //     desc: "Detect delayed incidents automatically and highlight breach risks in real time.",
// //     icon: <Clock className="w-5 h-5 text-purple-400" />,
// //     gradient: "from-purple-500/10 to-indigo-500/10",
// //   },
// //   {
// //     title: "Smart Assignment",
// //     desc: "Assign incidents to the most suitable staff member based on workload and department.",
// //     icon: <UserPlus className="w-5 h-5 text-pink-400" />,
// //     gradient: "from-pink-500/10 to-rose-500/10",
// //   },
// //   {
// //     title: "Live Notifications",
// //     desc: "Get instant alerts for new tickets, updates, approvals, and important actions.",
// //     icon: <Bell className="w-5 h-5 text-yellow-400" />,
// //     gradient: "from-yellow-500/10 to-orange-500/10",
// //   },
// //   {
// //     title: "Analytics Dashboard",
// //     desc: "View incident trends, team performance, department load, and response insights.",
// //     icon: <Search className="w-5 h-5 text-cyan-400" />,
// //     gradient: "from-cyan-500/10 to-sky-500/10",
// //   },
// // ];

// // export default function Home() {
// //   const { scrollYProgress } = useScroll();
// //   const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

// //   return (
// //     <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-blue-500/30 font-sans">
// //       <GridBackground />

// //       {/* Navbar Placeholder */}
// //       <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
// //           <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
// //             <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
// //               <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
// //             </div>
// //             AIMS
// //           </div>
// //           <div className="flex gap-3 sm:gap-4">
// //             <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center">
// //               Login
// //             </Link>
// //             <Link to="/register" className="text-sm font-medium bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 px-3 py-1.5 rounded-md transition-colors">
// //               Register
// //             </Link>
// //           </div>
// //         </div>
// //       </nav>

// //       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20">
        
// //         {/* HERO SECTION */}
// //         <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[calc(100vh-12rem)] lg:min-h-[70vh]">
          
// //           {/* Left: Content */}
// //           <motion.div 
// //             variants={containerVariants}
// //             initial="hidden"
// //             animate="visible"
// //             className="flex flex-col items-start text-left pt-10 lg:pt-0"
// //           >
// //             <motion.h1 
// //               variants={itemVariants}
// //               className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1]"
// //             >
// //               Resolve Incidents <br className="hidden sm:block" />
// //               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
// //                 Before They Escalate.
// //               </span>
// //             </motion.h1>

// //             <motion.p 
// //               variants={itemVariants}
// //               className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-8"
// //             >
// //               The enterprise-grade Automated Incident Management System. 
// //               Streamline your IT operations with real-time tracking, SLA monitoring, and intelligent role-based workflows.
// //             </motion.p>

// //             <motion.div 
// //               variants={itemVariants}
// //               className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
// //             >
// //               <Link to="/login" className="w-full sm:w-auto">
// //                 <motion.button
// //                   whileHover={{ scale: 1.02 }}
// //                   whileTap={{ scale: 0.98 }}
// //                   className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
// //                 >
// //                   <LogIn className="w-4 h-4" />
// //                   Access Dashboard
// //                 </motion.button>
// //               </Link>

// //               <Link to="/register" className="w-full sm:w-auto">
// //                 <motion.button
// //                   whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
// //                   whileTap={{ scale: 0.98 }}
// //                   className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold transition-all focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
// //                 >
// //                   <UserPlus className="w-4 h-4" />
// //                   Create Account
// //                 </motion.button>
// //               </Link>
// //             </motion.div>

// //             <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-500">
// //               <div className="flex -space-x-3">
// //                 {[
// //                   { name: "K", gradient: "from-blue-500 to-cyan-400", online: true },
// //                   { name: "A", gradient: "from-emerald-500 to-teal-400", online: true },
// //                   { name: "M", gradient: "from-purple-500 to-indigo-400", online: false },
// //                   { name: "S", gradient: "from-orange-500 to-amber-400", online: true },
// //                 ].map((u, i) => (
// //                   <motion.div
// //                     key={i}
// //                     initial={{ opacity: 0, y: 10, scale: 0.9 }}
// //                     animate={{ opacity: 1, y: 0, scale: 1 }}
// //                     transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
// //                     className="relative"
// //                   >
// //                     {/* Avatar */}
// //                     <motion.div
// //                       animate={{
// //                         y: [0, -4, 0],
// //                         scale: [1, 1.03, 1],
// //                       }}
// //                       transition={{
// //                         duration: 2.8,
// //                         repeat: Infinity,
// //                         ease: "easeInOut",
// //                         delay: i * 0.2,
// //                       }}
// //                       whileHover={{ scale: 1.08, y: -6 }}
// //                       className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-950 shadow-lg shadow-blue-500/10 overflow-hidden"
// //                     >
// //                       <div className={`w-full h-full bg-gradient-to-br ${u.gradient} flex items-center justify-center`}>
// //                         <span className="text-white font-bold text-xs sm:text-sm">{u.name}</span>
// //                       </div>
// //                     </motion.div>

// //                     {/* Glow ring (animated) */}
// //                     <motion.div
// //                       className="absolute inset-0 rounded-full ring-2 ring-blue-500/20 pointer-events-none"
// //                       animate={{ opacity: [0.15, 0.35, 0.15] }}
// //                       transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
// //                     />

// //                     {/* Online dot */}
// //                     {u.online && (
// //                       <motion.div
// //                         className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-slate-950"
// //                         animate={{ scale: [1, 1.25, 1] }}
// //                         transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
// //                       />
// //                     )}
// //                   </motion.div>
// //                 ))}
// //               </div>
// //               <p className="text-xs sm:text-sm">Developed by Information Technology final year students</p>
// //             </motion.div>
// //           </motion.div>

// //           {/* Right: 2D Visual Mockup */}
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.95 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             transition={{ duration: 0.8, delay: 0.2 }}
// //             className="relative w-full mt-8 lg:mt-0"
// //           >
// //              <DashboardMockup />
// //           </motion.div>
// //         </div>

// //         {/* FEATURES SECTION */}
// //         <section className="py-20 sm:py-32 relative">
// //           <div className="text-center mb-12 sm:mb-16">
// //             <motion.h2 
// //               initial={{ opacity: 0, y: 20 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               viewport={{ once: true }}
// //               className="text-3xl sm:text-4xl font-bold mb-4"
// //             >
// //               Built for Reliability
// //             </motion.h2>
// //             <motion.p 
// //               initial={{ opacity: 0, y: 20 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               viewport={{ once: true }}
// //               transition={{ delay: 0.1 }}
// //               className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base"
// //             >
// //               Everything you need to manage incidents effectively, wrapped in a modern interface.
// //             </motion.p>
// //           </div>

// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
// //             {features.map((item, i) => (
// //               <motion.div
// //                 key={i}
// //                 initial={{ opacity: 0, y: 20 }}
// //                 whileInView={{ opacity: 1, y: 0 }}
// //                 viewport={{ once: true }}
// //                 transition={{ delay: i * 0.1 }}
// //                 whileHover={{ y: -5 }}
// //                 className={`group relative p-6 sm:p-8 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-600 transition-all duration-300 overflow-hidden ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
// //               >
// //                 <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
// //                 <div className="relative z-10">
// //                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
// //                     {item.icon}
// //                   </div>
                  
// //                   <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
// //                     {item.title}
// //                   </h3>
// //                   <p className="text-slate-400 text-sm leading-relaxed mb-4 sm:mb-6">
// //                     {item.desc}
// //                   </p>

// //                   <div className="flex items-center text-xs sm:text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
// //                     Learn more <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             ))}
// //           </div>
// //         </section>

// //         {/* FOOTER */}
// //         <motion.footer 
// //           initial={{ opacity: 0 }}
// //           whileInView={{ opacity: 1 }}
// //           viewport={{ once: true }}
// //           className="border-t border-slate-800/50 pt-10 sm:pt-12 pb-6 text-center"
// //         >
// //           <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
// //             <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
// //               <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
// //             </div>
// //             <span className="font-bold text-base sm:text-lg tracking-tight">AIMS</span>
// //           </div>
// //           <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm text-slate-400">
// //             <a href="#" className="hover:text-white transition-colors">Privacy</a>
// //             <a href="#" className="hover:text-white transition-colors">Terms</a>
// //             <a href="#" className="hover:text-white transition-colors">Support</a>
// //           </div>
// //           <p className="text-slate-600 text-xs sm:text-sm">
// //             © {new Date().getFullYear()} Automated Incident Management System.
// //           </p>
// //           <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">Developed by Khan Mohammed Kaif.</p>
// //         </motion.footer>
// //       </div>
// //     </div>
// //   );
// // }

// import React from "react";
// import { Link } from "react-router-dom";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { 
//   ShieldCheck, Activity, Clock, ArrowRight, LogIn, UserPlus, AlertCircle, Search, Bell, Hexagon, Zap, Cpu, Crosshair
// } from "lucide-react";

// const LiveSystemStatus = () => (
//   <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#05d9e8]/10 border border-[#05d9e8]/30 rounded-none sm:rounded-bl-xl sm:rounded-tr-xl backdrop-blur-md shadow-[0_0_15px_rgba(5,217,232,0.2)]">
//     <div className="w-2 h-2 rounded-full bg-[#05d9e8] animate-pulse shadow-[0_0_8px_#05d9e8]" />
//     <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#05d9e8] uppercase">Sys.Operational</span>
//   </div>
// );

// const GridBackground = () => (
//   <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#05050a]">
//     <div className="absolute inset-0 bg-[linear-gradient(to_right,#05d9e810_1px,transparent_1px),linear-gradient(to_bottom,#05d9e810_1px,transparent_1px)] bg-[size:32px_32px]" />
//     <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
    
//     <motion.div 
//       className="absolute left-[-10%] top-[-10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#ff2a6d]/20 blur-[100px] sm:blur-[150px]"
//       animate={{ x: [0, 60, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
//       transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
//     />
//     <motion.div 
//       className="absolute right-[-10%] bottom-[-10%] h-[300px] w-[300px] sm:h-[600px] sm:w-[600px] rounded-full bg-[#05d9e8]/15 blur-[100px] sm:blur-[150px]"
//       animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
//       transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
//     />
//     <motion.div 
//       className="absolute left-[40%] top-[40%] h-[200px] w-[200px] rounded-full bg-[#bd00ff]/15 blur-[80px]"
//       animate={{ opacity: [0.5, 1, 0.5] }}
//       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//     />
//   </div>
// );

// const DashboardMockup = () => {
//   return (
//     <div className="relative w-full flex items-center justify-center py-10 sm:py-0 perspective-1000">
//       <motion.div
//         initial={{ opacity: 0, rotateX: 20, y: 40 }}
//         animate={{ opacity: 1, rotateX: 0, y: 0 }}
//         transition={{ duration: 1, type: "spring", stiffness: 80, damping: 20 }}
//         className="relative w-full max-w-[550px] aspect-[4/3] bg-[#0a0a12]/80 backdrop-blur-xl border-2 border-[#05d9e8]/30 shadow-[0_0_30px_rgba(5,217,232,0.15)] flex flex-col overflow-hidden"
//         style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}
//       >
//         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#05d9e8] via-[#ff2a6d] to-[#bd00ff]" />

//         <div className="h-10 sm:h-12 border-b border-[#05d9e8]/20 flex items-center px-3 sm:px-4 justify-between shrink-0 bg-[#05d9e8]/5">
//           <div className="flex gap-2 items-center">
//             <div className="flex gap-1">
//               <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-3 h-3 bg-[#ff2a6d] transform rotate-45" />
//               <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, delay: 0.2, repeat: Infinity }} className="w-3 h-3 bg-[#e8d905] transform rotate-45" />
//               <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, delay: 0.4, repeat: Infinity }} className="w-3 h-3 bg-[#05d9e8] transform rotate-45" />
//             </div>
//             <span className="ml-2 text-[10px] font-black text-[#05d9e8] tracking-widest hidden sm:block">UI_CORE_V2.4</span>
//           </div>
//           <div className="flex gap-3 text-[#05d9e8]/70">
//             <Search className="w-4 h-4 hover:text-[#05d9e8] transition-colors cursor-pointer" />
//             <Bell className="w-4 h-4 hover:text-[#05d9e8] transition-colors cursor-pointer" />
//           </div>
//         </div>

//         <div className="p-3 sm:p-5 grid grid-cols-12 gap-3 sm:gap-5 flex-1 overflow-hidden">
//           <div className="col-span-3 flex flex-col gap-3 sm:gap-4 border-r border-[#05d9e8]/20 pr-3 relative">
//             <div className="absolute right-[-1px] top-0 w-[2px] h-10 bg-[#05d9e8] shadow-[0_0_8px_#05d9e8]" />
//             {[1, 2, 3, 4].map((i) => (
//               <motion.div 
//                 key={i}
//                 className="h-2 w-full bg-[#05d9e8]/20 transform -skew-x-12"
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
//                 whileHover={{ backgroundColor: "rgba(5,217,232,0.6)", scale: 1.05 }}
//               />
//             ))}
//           </div>

//           <div className="col-span-9 flex flex-col gap-4 sm:gap-5">
//             <div className="grid grid-cols-3 gap-2 sm:gap-3">
//               {[
//                 { c: "#05d9e8", t: "INIT" },
//                 { c: "#ff2a6d", t: "WARN" },
//                 { c: "#bd00ff", t: "EXEC" }
//               ].map((item, i) => (
//                 <motion.div 
//                   key={i} 
//                   className="h-14 sm:h-20 bg-[#05d9e8]/5 border border-[#05d9e8]/20 p-2 sm:p-3 flex flex-col justify-between relative overflow-hidden group"
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ type: "spring", stiffness: 120, damping: 15, delay: i * 0.2 + 0.5 }}
//                 >
//                   <div className={`absolute top-0 right-0 w-8 h-8 bg-[${item.c}]/10 rounded-bl-full group-hover:scale-150 transition-transform`} />
//                   <div className="flex justify-between items-start">
//                     <div className={`w-2 h-2 sm:w-3 sm:h-3 bg-[${item.c}] shadow-[0_0_5px_${item.c}]`} />
//                     <span className={`text-[8px] sm:text-[10px] font-bold text-[${item.c}] tracking-wider`}>{item.t}</span>
//                   </div>
//                   <div className="w-full h-1.5 bg-[#05d9e8]/20 mt-auto">
//                     <motion.div 
//                       className={`h-full bg-[${item.c}]`}
//                       initial={{ width: 0 }}
//                       animate={{ width: `${Math.random() * 60 + 30}%` }}
//                       transition={{ duration: 1.5, delay: 1 + i * 0.2, ease: "easeOut" }}
//                     />
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             <div className="flex-1 bg-[#05d9e8]/5 border border-[#05d9e8]/20 relative overflow-hidden group p-2">
//               <div className="absolute top-2 left-2 text-[8px] text-[#05d9e8]/50 font-mono">DATA_STREAM :: ACTIVE</div>
//               <div className="absolute bottom-0 left-0 right-0 h-[80%] flex items-end justify-around px-2 pb-2 gap-1 sm:gap-2">
//                 {[40, 70, 50, 90, 60, 80, 45, 70, 85, 55].map((h, i) => (
//                   <motion.div 
//                     key={i}
//                     initial={{ height: 0 }}
//                     animate={{ height: `${h}%` }}
//                     transition={{ duration: 1.2, delay: 1.2 + i * 0.05, type: "spring", stiffness: 80 }}
//                     className="w-full bg-gradient-to-t from-[#05d9e8]/20 to-[#05d9e8]/60 group-hover:to-[#05d9e8] transition-colors relative"
//                   >
//                     <div className="absolute top-0 left-0 w-full h-[2px] bg-[#fff] shadow-[0_0_8px_#05d9e8]" />
//                   </motion.div>
//                 ))}
//               </div>
//               <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(5,217,232,0.05)_50%)] bg-[size:100%_4px] pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         <motion.div 
//           animate={{ y: [0, -10, 0] }}
//           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute -right-2 sm:-right-8 -top-4 sm:-top-6 bg-[#0a0a12] p-2 sm:p-4 border border-[#ff2a6d]/50 shadow-[0_0_20px_rgba(255,42,109,0.3)] flex items-center gap-2 sm:gap-3 z-10 scale-90 sm:scale-100"
//           style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
//         >
//           <div className="p-1.5 sm:p-2 bg-[#ff2a6d]/20">
//             <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-[#ff2a6d] animate-pulse" />
//           </div>
//           <div>
//             <div className="text-[9px] sm:text-[10px] text-[#ff2a6d] font-mono tracking-widest uppercase">System Breach</div>
//             <div className="text-xs sm:text-sm font-black text-white uppercase italic tracking-wider">Alert Level 9</div>
//           </div>
//         </motion.div>

//         <motion.div 
//           animate={{ y: [0, -5, 0] }}
//           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//           className="absolute -left-2 sm:-left-6 bottom-4 sm:bottom-12 z-10 scale-90 sm:scale-100"
//         >
//             <LiveSystemStatus/>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// };

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.15, delayChildren: 0.2 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" },
//   visible: { 
//     opacity: 1, 
//     y: 0,
//     scale: 1,
//     filter: "blur(0px)",
//     transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 20 }
//   },
// };

// const features = [
//   {
//     title: "INCIDENT_TRACKING",
//     desc: "Track every issue from creation to resolution with live status updates.",
//     icon: <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 text-[#05d9e8]" />,
//     color: "#05d9e8",
//   },
//   {
//     title: "ROLE_ACCESS",
//     desc: "Separate dashboards and permissions for Users, Staff, Admins, and Super Admin.",
//     icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#bd00ff]" />,
//     color: "#bd00ff",
//   },
//   {
//     title: "SLA_MONITORING",
//     desc: "Detect delayed incidents automatically and highlight breach risks in real time.",
//     icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff2a6d]" />,
//     color: "#ff2a6d",
//   },
//   {
//     title: "SMART_ASSIGN",
//     desc: "Assign incidents to the most suitable staff member based on workload and department.",
//     icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#e8d905]" />,
//     color: "#e8d905",
//   },
//   {
//     title: "LIVE_ALERTS",
//     desc: "Get instant alerts for new tickets, updates, approvals, and important actions.",
//     icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#05d9e8]" />,
//     color: "#05d9e8",
//   },
//   {
//     title: "DATA_ANALYTICS",
//     desc: "View incident trends, team performance, department load, and response insights.",
//     icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#bd00ff]" />,
//     color: "#bd00ff",
//   },
// ];

// export default function Home() {
//   const { scrollYProgress } = useScroll();
//   const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

//   return (
//     <div className="relative min-h-screen bg-[#05050a] text-white overflow-x-hidden selection:bg-[#ff2a6d]/40 selection:text-white font-sans">
//       <GridBackground />

//       <nav className="fixed top-0 w-full z-50 border-b border-[#05d9e8]/20 bg-[#05050a]/80 backdrop-blur-xl">
//         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#05d9e8] to-transparent opacity-50" />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
//           <div className="flex items-center gap-3 font-black text-xl sm:text-2xl tracking-tighter italic uppercase">
//             <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
//               <Hexagon className="absolute inset-0 w-full h-full text-[#05d9e8] animate-[spin_10s_linear_infinite]" strokeWidth={1.5} />
//               <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff2a6d]" />
//             </div>
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#05d9e8]">AIMS</span>
//             <span className="text-[10px] sm:text-xs text-[#05d9e8]/50 font-mono not-italic tracking-widest hidden sm:block ml-2 border border-[#05d9e8]/30 px-2 py-0.5 rounded-full">v2.0_ONLINE</span>
//           </div>
//           <div className="flex gap-4 sm:gap-6 items-center">
//             <Link to="/login" className="text-xs sm:text-sm font-bold text-[#05d9e8]/70 hover:text-[#05d9e8] transition-colors uppercase tracking-widest">
//               Login
//             </Link>
//             <Link to="/register" className="relative group">
//               <div className="absolute inset-0 bg-[#05d9e8] transform skew-x-[-15deg] group-hover:bg-[#ff2a6d] transition-colors duration-300 shadow-[0_0_15px_rgba(5,217,232,0.4)] group-hover:shadow-[0_0_20px_rgba(255,42,109,0.6)]" />
//               <div className="relative px-4 sm:px-6 py-2 text-xs sm:text-sm font-black text-[#05050a] uppercase tracking-widest italic">
//                 Register
//               </div>
//             </Link>
//           </div>
//         </div>
//       </nav>

//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-40 pb-16 sm:pb-24">
        
//         <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-12rem)] lg:min-h-[75vh]">
          
//           <motion.div 
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="flex flex-col items-start text-left"
//           >
//             <motion.div variants={itemVariants} className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1 border border-[#ff2a6d]/40 bg-[#ff2a6d]/10 text-[#ff2a6d] text-[10px] sm:text-xs font-mono tracking-widest uppercase" style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}>
//               <Zap className="w-3 h-3" /> System Ready
//             </motion.div>

//             <motion.h1 
//               variants={itemVariants}
//               className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-white mb-6 leading-[0.9] uppercase"
//             >
//               Resolve <br/>
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] via-[#bd00ff] to-[#ff2a6d]">
//                 Incidents
//               </span><br/>
//               <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-300">Before they escalate.</span>
//             </motion.h1>

//             <motion.p 
//               variants={itemVariants}
//               className="text-sm sm:text-base md:text-lg text-[#05d9e8]/70 max-w-xl leading-relaxed mb-10 font-medium"
//             >
//               The enterprise-grade Automated Incident Management System. 
//               Streamline your IT operations with real-time tracking, SLA monitoring, and intelligent role-based workflows.
//             </motion.p>

//             <motion.div 
//               variants={itemVariants}
//               className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
//             >
//               <Link to="/login" className="w-full sm:w-auto group relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-[#05d9e8] to-[#bd00ff] transform -skew-x-12 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(5,217,232,0.4)]" />
//                 <div className="relative px-8 sm:px-10 py-4 flex items-center justify-center gap-3 text-white font-black italic uppercase tracking-widest text-sm sm:text-base">
//                   <LogIn className="w-5 h-5" />
//                   Access_Core
//                 </div>
//               </Link>

//               <Link to="/register" className="w-full sm:w-auto group relative">
//                 <div className="absolute inset-0 border-2 border-[#05d9e8]/50 bg-[#05d9e8]/5 transform -skew-x-12 group-hover:bg-[#05d9e8]/20 transition-colors duration-300" />
//                 <div className="relative px-8 sm:px-10 py-4 flex items-center justify-center gap-3 text-[#05d9e8] font-black italic uppercase tracking-widest text-sm sm:text-base">
//                   <UserPlus className="w-5 h-5" />
//                   Init_User
//                 </div>
//               </Link>
//             </motion.div>

//             <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-5 text-sm text-slate-500 font-mono">
//               <div className="flex -space-x-3">
//                 {[
//                   { name: "K", color: "#05d9e8" },
//                   { name: "A", color: "#ff2a6d" },
//                   { name: "M", color: "#bd00ff" },
//                   { name: "S", color: "#e8d905" },
//                 ].map((u, i) => (
//                   <motion.div
//                     key={i}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
//                     className="relative z-10 hover:z-20"
//                   >
//                     <motion.div
//                       whileHover={{ y: -5, scale: 1.1 }}
//                       className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#0a0a12] border-2 shadow-lg"
//                       style={{ borderColor: u.color, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", boxShadow: `0 0 15px ${u.color}40` }}
//                     >
//                       <span className="font-black text-sm sm:text-base" style={{ color: u.color }}>{u.name}</span>
//                     </motion.div>
//                   </motion.div>
//                 ))}
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-[#05d9e8] text-xs font-bold tracking-widest uppercase">Dev_Team_Alpha</span>
//                 <span className="text-[10px] text-slate-500">IT Final Year Project</span>
//               </div>
//             </motion.div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 1, delay: 0.3, type: "spring" }}
//             className="relative w-full mt-10 lg:mt-0"
//           >
//              <DashboardMockup />
//           </motion.div>
//         </div>

//         <section className="py-24 sm:py-36 relative">
//           <div className="text-center mb-16 sm:mb-24">
//             <motion.div 
//               initial={{ opacity: 0, scale: 0.8 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               className="inline-block mb-4"
//             >
//               <span className="px-4 py-1.5 border border-[#bd00ff]/50 bg-[#bd00ff]/10 text-[#bd00ff] text-xs font-mono tracking-widest uppercase">System Capabilities</span>
//             </motion.div>
//             <motion.h2 
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white mb-6"
//             >
//               Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] to-[#bd00ff]">Reliability</span>
//             </motion.h2>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
//             {features.map((item, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
//                 whileHover={{ y: -10 }}
//                 className="group relative p-8 bg-[#0a0a12]/80 backdrop-blur-sm border border-[#05d9e8]/20 transition-all duration-300"
//                 style={{ clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)" }}
//               >
//                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(45deg, transparent, ${item.color}15)` }} />
//                 <div className="absolute bottom-0 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                
//                 <div className="relative z-10">
//                   <div className="w-12 h-12 sm:w-14 sm:h-14 mb-6 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
//                     <Hexagon className="absolute inset-0 w-full h-full opacity-20" style={{ color: item.color }} fill="currentColor" />
//                     <div className="relative z-10">{item.icon}</div>
//                   </div>
                  
//                   <h3 className="text-lg sm:text-xl font-black italic tracking-wide text-white mb-3 uppercase flex items-center gap-2">
//                     <span className="text-[10px] text-slate-500 not-italic font-mono font-normal">[{`0${i+1}`}]</span>
//                     {item.title}
//                   </h3>
//                   <p className="text-[#05d9e8]/60 text-sm leading-relaxed mb-6 font-medium">
//                     {item.desc}
//                   </p>

//                   <div className="flex items-center text-xs sm:text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" style={{ color: item.color }}>
//                     Engage_Module <ArrowRight className="w-4 h-4 ml-2" />
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//         <motion.footer 
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           className="border-t border-[#05d9e8]/20 pt-12 pb-8 text-center relative"
//         >
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#05d9e8] to-transparent shadow-[0_0_10px_#05d9e8]" />
          
//           <div className="flex items-center justify-center gap-3 mb-8">
//             <Hexagon className="w-6 h-6 text-[#05d9e8]" strokeWidth={2} />
//             <span className="font-black text-xl italic tracking-widest uppercase text-white">AIMS_SYS</span>
//           </div>
//           <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8 text-xs sm:text-sm font-mono uppercase tracking-widest text-[#05d9e8]/50">
//             <a href="#" className="hover:text-[#05d9e8] transition-colors">Privacy_Protocol</a>
//             <a href="#" className="hover:text-[#05d9e8] transition-colors">Terms_Of_Use</a>
//             <a href="#" className="hover:text-[#05d9e8] transition-colors">Support_Net</a>
//           </div>
//           <p className="text-[#05d9e8]/30 text-xs sm:text-sm font-mono">
//             © {new Date().getFullYear()} AUTOMATED INCIDENT MANAGEMENT SYSTEM // NERV_CORE
//           </p>
//           <p className="text-[#05d9e8]/50 text-xs sm:text-sm mt-2 font-mono uppercase tracking-widest">
//             Developed by Khan Mohammed Kaif.
//           </p>
//         </motion.footer>
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ShieldCheck, Activity, Clock, ArrowRight, LogIn, UserPlus, AlertCircle, Search, Bell, Hexagon, Zap, Cpu, Crosshair, Terminal
} from "lucide-react";

// --- Hud-style Live Status ---
const LiveSystemStatus = () => (
  <div className="flex items-center gap-3 px-4 py-2 bg-[#05d9e8]/10 border-l-4 border-[#05d9e8] backdrop-blur-md shadow-[0_0_20px_rgba(5,217,232,0.2)]">
    <div className="relative">
      <div className="w-2 h-2 rounded-full bg-[#05d9e8] animate-ping absolute inset-0" />
      <div className="w-2 h-2 rounded-full bg-[#05d9e8] relative" />
    </div>
    <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-[#05d9e8] uppercase italic">
      Core_Link: Stable
    </span>
  </div>
);

// --- Cyber-Grid Background with scanning effects ---
const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#020205]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#05d9e80a_1px,transparent_1px),linear-gradient(to_bottom,#05d9e80a_1px,transparent_1px)] bg-[size:40px_40px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020205_80%)]" />
    
    {/* Animated Scanning Line */}
    <motion.div 
      className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#05d9e8]/30 to-transparent z-1"
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />

    <motion.div 
      className="absolute left-[-5%] top-[-5%] h-[400px] w-[400px] rounded-full bg-[#ff2a6d]/10 blur-[120px]"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <motion.div 
      className="absolute right-[-5%] bottom-[-5%] h-[500px] w-[500px] rounded-full bg-[#05d9e8]/10 blur-[150px]"
      animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 12, repeat: Infinity }}
    />
  </div>
);

// --- Mecha-HUD Dashboard Mockup ---
const DashboardMockup = () => {
  return (
    <div className="relative w-full flex items-center justify-center py-10 sm:py-0 perspective-[1200px]">
      <motion.div
        initial={{ opacity: 0, rotateY: -15, rotateX: 10, scale: 0.9 }}
        animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[550px] aspect-[16/11] bg-[#0a0a12]/90 backdrop-blur-2xl border border-[#05d9e8]/30 shadow-[0_0_50px_rgba(5,217,232,0.1)] flex flex-col overflow-hidden"
        style={{ clipPath: "polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)" }}
      >
        {/* Decorative HUD Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#05d9e8] via-[#ff2a6d] to-transparent" />
        <div className="absolute top-2 right-4 text-[8px] font-mono text-[#05d9e8]/40 tracking-tighter">OS_TYPE: AIMS_NEURAL_V4</div>
        
        {/* Header */}
        <div className="h-12 border-b border-[#05d9e8]/20 flex items-center px-4 justify-between bg-[#05d9e8]/5">
          <div className="flex gap-2 items-center">
            <Terminal className="w-4 h-4 text-[#05d9e8]" />
            <span className="text-[10px] font-black text-[#05d9e8] tracking-[0.3em] uppercase">Tactical_Interface</span>
          </div>
          <div className="flex gap-3">
             <div className="w-2 h-2 rounded-full bg-[#ff2a6d] shadow-[0_0_8px_#ff2a6d]" />
             <div className="w-2 h-2 rounded-full bg-[#e8d905] shadow-[0_0_8px_#e8d905]" />
             <div className="w-2 h-2 rounded-full bg-[#05d9e8] shadow-[0_0_8px_#05d9e8]" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 grid grid-cols-12 gap-4 flex-1">
          {/* Sidebar HUD */}
          <div className="col-span-3 flex flex-col gap-3 border-r border-[#05d9e8]/10 pr-3">
            {[80, 45, 90, 60].map((w, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[7px] text-[#05d9e8]/50 font-mono">
                  <span>CH_{i+1}</span>
                  <span>{w}%</span>
                </div>
                <div className="h-1 bg-[#05d9e8]/10 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 2, delay: i * 0.2 }}
                    className="h-full bg-[#05d9e8] shadow-[0_0_10px_#05d9e8]"
                  />
                </div>
              </div>
            ))}
            <div className="mt-auto pt-4 border-t border-[#05d9e8]/10">
               <div className="w-full aspect-square border border-[#05d9e8]/20 rounded-full flex items-center justify-center relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-[#ff2a6d] rounded-full"
                  />
                  <Activity className="w-4 h-4 text-[#05d9e8] animate-pulse" />
               </div>
            </div>
          </div>

          {/* Main Visuals */}
          <div className="col-span-9 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-[#ff2a6d]/5 border border-[#ff2a6d]/20 p-2 relative overflow-hidden group">
                <div className="text-[8px] font-bold text-[#ff2a6d] mb-1">THREAT_LEVEL</div>
                <div className="text-xl font-black text-white italic">CRITICAL</div>
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-[#ff2a6d]/10 -mr-4 -mb-4 rotate-45 group-hover:bg-[#ff2a6d]/20 transition-colors" />
              </div>
              <div className="h-20 bg-[#05d9e8]/5 border border-[#05d9e8]/20 p-2 relative">
                <div className="text-[8px] font-bold text-[#05d9e8] mb-1">SYNC_RATE</div>
                <div className="text-xl font-black text-white italic">98.4%</div>
              </div>
            </div>

            <div className="flex-1 bg-[#05d9e8]/5 border border-[#05d9e8]/10 relative p-2 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Hexagon className="w-32 h-32 text-[#05d9e8]" strokeWidth={0.5} />
              </div>
              <div className="relative h-full flex items-end gap-1">
                {[30, 60, 40, 80, 50, 90, 70, 40, 60, 85].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 1 + (i * 0.05) }}
                    className="flex-1 bg-gradient-to-t from-[#05d9e8]/40 to-[#05d9e8] relative group"
                  >
                    <div className="absolute -top-1 left-0 w-full h-[2px] bg-white shadow-[0_0_10px_#fff]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Warning */}
        <motion.div 
          animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-6 z-20 bg-[#ff2a6d] text-white px-3 py-1 text-[10px] font-black skew-x-[-15deg] shadow-[0_0_20px_#ff2a6d]"
        >
          SYSTEM_ALERT: UNKNOWN_ENTITY
        </motion.div>
      </motion.div>

      {/* Background HUD Elements */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 pointer-events-none">
        <div className="w-full h-full border-[20px] border-[#05d9e8]/5 rounded-full" />
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30, skewX: 10 },
  visible: { 
    opacity: 1, 
    x: 0, 
    skewX: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

const features = [
  {
    title: "INCIDENT_TRACK",
    desc: "Deploy real-time surveillance on every system anomaly from creation to purge.",
    icon: <Crosshair className="w-6 h-6 text-[#05d9e8]" />,
    color: "#05d9e8",
  },
  {
    title: "NEURAL_ACCESS",
    desc: "Multi-tier permission protocols for Users, Staff, and High-Command Admins.",
    icon: <ShieldCheck className="w-6 h-6 text-[#bd00ff]" />,
    color: "#bd00ff",
  },
  {
    title: "TIME_BREACH",
    desc: "SLA monitoring engine detects delays before they compromise the mission.",
    icon: <Clock className="w-6 h-6 text-[#ff2a6d]" />,
    color: "#ff2a6d",
  },
  {
    title: "AUTO_DEPLOY",
    desc: "Intelligent task routing based on staff combat-readiness and department load.",
    icon: <Cpu className="w-6 h-6 text-[#e8d905]" />,
    color: "#e8d905",
  },
  {
    title: "SYNC_ALERTS",
    desc: "Instant neural-link notifications for critical updates and ticket approvals.",
    icon: <Zap className="w-6 h-6 text-[#05d9e8]" />,
    color: "#05d9e8",
  },
  {
    title: "DATA_VISUAL",
    desc: "High-fidelity analytics dashboard for trend analysis and performance metrics.",
    icon: <Activity className="w-6 h-6 text-[#bd00ff]" />,
    color: "#bd00ff",
  },
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div className="relative min-h-screen bg-[#020205] text-white overflow-x-hidden selection:bg-[#ff2a6d] selection:text-white font-sans">
      <GridBackground />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#05d9e8]/20 bg-[#020205]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#05d9e8] blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
              <Hexagon className="w-10 h-10 text-[#05d9e8] relative z-10" strokeWidth={2} />
              <Activity className="w-5 h-5 text-[#ff2a6d] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
            </div>
            <span className="font-black text-2xl tracking-tighter italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-[#05d9e8]">
              AIMS_SYS
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black tracking-[0.3em] uppercase italic text-[#05d9e8]/60">
            <a href="#" className="hover:text-[#05d9e8] transition-colors">Network</a>
            <a href="#" className="hover:text-[#05d9e8] transition-colors">Database</a>
            <a href="#" className="hover:text-[#05d9e8] transition-colors">Security</a>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2 text-xs font-black uppercase italic tracking-widest text-[#05d9e8] hover:bg-[#05d9e8]/10 transition-all border border-[#05d9e8]/20">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 text-xs font-black uppercase italic tracking-widest bg-[#ff2a6d] text-white hover:bg-[#ff2a6d]/80 transition-all shadow-[0_0_15px_rgba(255,42,109,0.4)]">
              Initialize
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2">
              <span className="w-12 h-[1px] bg-[#ff2a6d]" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#ff2a6d] italic">Status: Online</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              style={{ y: titleY }}
              className="text-6xl sm:text-7xl md:text-8xl font-black italic tracking-tighter text-white mb-8 leading-[0.85] uppercase"
            >
              Resolve <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] via-[#bd00ff] to-[#ff2a6d]">
                Incidents
              </span><br/>
              <span className="text-4xl md:text-5xl text-white/40">In Real-Time.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-[#05d9e8]/70 max-w-lg leading-relaxed mb-12 font-medium italic border-l-2 border-[#05d9e8]/30 pl-6"
            >
              The ultimate automated incident management system for high-stakes IT operations. 
              Deploy intelligent workflows and maintain 100% operational sync.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Link to="/login" className="group relative">
                <div className="absolute inset-0 bg-[#05d9e8] skew-x-[-12deg] group-hover:bg-[#05d9e8]/80 transition-colors shadow-[0_0_20px_rgba(5,217,232,0.4)]" />
                <div className="relative px-10 py-5 flex items-center justify-center gap-3 text-[#020205] font-black italic uppercase tracking-widest text-base">
                  <LogIn className="w-5 h-5" />
                  Access_Core
                </div>
              </Link>

              <Link to="/register" className="group relative">
                <div className="absolute inset-0 border-2 border-[#05d9e8]/40 skew-x-[-12deg] group-hover:bg-[#05d9e8]/5 transition-all" />
                <div className="relative px-10 py-5 flex items-center justify-center gap-3 text-[#05d9e8] font-black italic uppercase tracking-widest text-base">
                  <UserPlus className="w-5 h-5" />
                  Register_Unit
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-4">
                {['K', 'A', 'M', 'S'].map((n, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10, scale: 1.1 }}
                    className="w-12 h-12 bg-[#0a0a12] border-2 border-[#05d9e8] flex items-center justify-center font-black italic text-[#05d9e8] shadow-[0_0_15px_rgba(5,217,232,0.2)]"
                    style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                Developed By <br/> <span className="text-white/60">IT_Special_Ops_Team</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
             <DashboardMockup />
          </motion.div>
        </div>

        {/* FEATURES SECTION */}
        <section className="py-32 relative">
          <div className="text-center mb-24 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-white/[0.02] uppercase italic tracking-tighter select-none">
                CAPABILITIES
             </div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4 relative z-10"
            >
              System <span className="text-[#05d9e8]">Parameters</span>
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              className="h-1 bg-gradient-to-r from-transparent via-[#ff2a6d] to-transparent mx-auto w-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, borderColor: item.color }}
                className="group relative p-10 bg-[#0a0a12]/60 backdrop-blur-md border border-white/5 transition-all duration-500 overflow-hidden"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)" }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-30 transition-opacity" style={{ color: item.color }}>
                   <Hexagon className="w-full h-full" fill="currentColor" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 mb-8 flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-[#05d9e8]/50 transition-all duration-500">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-xl font-black italic tracking-widest text-white mb-4 uppercase group-hover:text-[#05d9e8] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-8 font-medium">
                    {item.desc}
                  </p>

                  <div className="flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-[#05d9e8] opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0 transition-all duration-500">
                    Launch_Module <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 border-t border-white/5 pt-16 pb-10 text-center relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-[#05d9e8] shadow-[0_0_15px_#05d9e8]" />
          
          <div className="flex items-center justify-center gap-3 mb-10">
            <Hexagon className="w-8 h-8 text-[#05d9e8]" strokeWidth={2} />
            <span className="font-black text-2xl italic tracking-tighter uppercase text-white">AIMS_FINAL_CORE</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 mb-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">
            {/* <a href="#" className="hover:text-[#ff2a6d] transition-colors">Protocol_Privacy</a>
            <a href="#" className="hover:text-[#ff2a6d] transition-colors">Service_Terms</a> */}
            <Link to="/support" className="hover:text-[#ff2a6d] transition-colors">Support_Net</Link> 
            <Link to="/contact" className="hover:text-[#ff2a6d] transition-colors">Contact_Us</Link>
            <Link to="/about" className="hover:text-[#ff2a6d] transition-colors">About_The_System</Link>
            <Link to="/docs" className="hover:text-[#ff2a6d] transition-colors">Documentation</Link>
            <Link to="/privacy" className="hover:text-[#ff2a6d] transition-colors">Privacy_Policy</Link>
            <Link to="/terms" className="hover:text-[#ff2a6d] transition-colors">Terms_of_Service</Link>

          </div>

          <div className="space-y-2">
            <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} AUTOMATED INCIDENT MANAGEMENT SYSTEM 
            </p>
            <p className="text-[#05d9e8]/40 text-xs font-black italic uppercase tracking-widest">
              Developed by Khan Mohammed Kaif
            </p>
          </div>

          <div className="mt-12 flex justify-center gap-2">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-1 h-1 bg-[#05d9e8]/20 rounded-full" />
             ))}
          </div>
        </motion.footer>
      </div>

      {/* Persistent HUD elements */}
      <div className="fixed bottom-6 left-6 z-50 hidden sm:block">
        <LiveSystemStatus />
      </div>
      <div className="fixed top-1/2 right-4 -translate-y-1/2 z-50 flex flex-col gap-4 opacity-20 hover:opacity-100 transition-opacity hidden lg:flex">
         {[1,2,3].map(i => (
           <div key={i} className="w-1 h-12 bg-[#05d9e8]/30 relative">
              <motion.div 
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="absolute left-0 w-full h-4 bg-[#05d9e8]"
              />
           </div>
         ))}
      </div>
    </div>
  );
}