import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { 
  ShieldCheck, Activity, Clock, ArrowRight, LogIn, UserPlus, CheckCircle2, AlertCircle, Users, Search, Bell
} from "lucide-react";

// --- Grid Background with animated blobs ---
const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    <motion.div 
      className="absolute left-0 top-0 h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"
      animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
      transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
    />
    <motion.div 
      className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-10 blur-[120px]"
      animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
    />
  </div>
);

// --- 3D Dashboard ---
const IsometricDashboard = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);
  const springConfig = { damping: 25, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  return (
    <motion.div 
      className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        className="relative w-[90%] md:w-[500px] aspect-[4/3] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-blue-900/20"
      >
        {/* Dashboard Header */}
        <div className="h-12 border-b border-slate-700/50 flex items-center px-4 justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex gap-3 text-slate-500">
            <Search className="w-4 h-4" />
            <Bell className="w-4 h-4" />
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-4 grid grid-cols-12 gap-4 h-[calc(100%-3rem)]">
          {/* Sidebar */}
          <div className="col-span-3 flex flex-col gap-3 border-r border-slate-700/30 pr-2">
            {[1,2,3,4].map(i => (
              <motion.div 
                key={i}
                className="h-2 w-full bg-slate-700/30 rounded-full"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 80 }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-9 flex flex-col gap-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => (
                <motion.div 
                  key={i} 
                  className="h-16 bg-slate-800/50 rounded-lg border border-slate-700/30 p-2"
                  initial={{ y: 20, z: 0 }}
                  animate={{ y: 0, z: 20 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15, delay: i*0.2 }}
                >
                  <div className="w-6 h-6 bg-blue-500/20 rounded mb-2" />
                  <div className="w-12 h-2 bg-slate-600/30 rounded" />
                </motion.div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/30 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 right-0 h-[60%] flex items-end justify-around px-2 pb-2 gap-1">
                {[40,70,50,90,60,80,45].map((h,i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0, z: 0 }}
                    animate={{ height: `${h}%`, z: 20 }}
                    transition={{ duration: 1, delay: 0.5 + i*0.1, type: "spring", stiffness: 100 }}
                    className="w-full bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Alert Cards */}
        <motion.div 
          style={{ transform: "translateZ(40px)" }}
          animate={{ y: [0, -8, 0], rotateZ: [0, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-6 -top-6 bg-slate-800 p-4 rounded-xl border border-slate-600 shadow-xl flex items-center gap-3"
        >
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Critical Alert</div>
            <div className="text-sm font-bold text-white">Server Down</div>
          </div>
        </motion.div>

        <motion.div 
          style={{ transform: "translateZ(20px)" }}
          animate={{ y: [0, -5, 0], rotateZ: [0, 1, -1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-4 bottom-10 bg-slate-800 p-3 rounded-xl border border-slate-600 shadow-xl flex items-center gap-3"
        >
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">System Status</div>
            <div className="text-sm font-bold text-white">99.9% Uptime</div>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};
// --- Main Page Component ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  },
};

const features = [
  {
    title: "Incident Tracking",
    desc: "Real-time monitoring and resolution pipeline.",
    icon: <Activity className="w-5 h-5 text-blue-400" />,
    gradient: "from-blue-500/10 to-cyan-500/10",
    border: "group-hover:border-blue-500/50"
  },
  {
    title: "Role Based Access",
    desc: "Granular permissions for Admins and Staff.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "group-hover:border-emerald-500/50"
  },
  {
    title: "SLA Monitoring",
    desc: "Automated breach detection and alerts.",
    icon: <Clock className="w-5 h-5 text-purple-400" />,
    gradient: "from-purple-500/10 to-indigo-500/10",
    border: "group-hover:border-purple-500/50"
  }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-blue-500/30 font-sans">
      <GridBackground />

      {/* Navbar Placeholder */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            AIMS
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">Register</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          
          {/* Left: Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              System Operational v2.0
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            >
              Resolve Incidents <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Before They Escalate.
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8"
            >
              The enterprise-grade Automated Incident Management System. 
              Streamline your IT operations with real-time tracking, SLA monitoring, and intelligent role-based workflows.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
                >
                  <LogIn className="w-4 h-4" />
                  Access Dashboard
                </motion.button>
              </Link>

              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-3.5 rounded-xl font-semibold transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </motion.button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-slate-400">
                    <Users className="w-3 h-3" />
                  </div>
                ))}
              </div>
              <p>Developed by Student of Information Technology final year students</p>
            </motion.div>
          </motion.div>

          {/* Right: 3D Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
             <IsometricDashboard />
          </motion.div>
        </div>

        {/* FEATURES SECTION */}
        <section className="py-32 relative">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Built for Reliability
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 max-w-xl mx-auto"
            >
              Everything you need to manage incidents effectively, wrapped in a modern interface.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {item.desc}
                  </p>

                  <div className="flex items-center text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                    Learn more <ArrowRight className="w-3 h-3 ml-1" />
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
          className="border-t border-slate-800/50 pt-12 pb-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <span className="font-bold text-lg tracking-tight">AIMS</span>
          </div>
          <div className="flex justify-center gap-6 mb-8 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Automated Incident Management System.
          </p>
          <p className="text-slate-500 text-sm">Developed by Khan Mohammed Kaif.</p>
        </motion.footer>
      </div>
    </div>
  );
}