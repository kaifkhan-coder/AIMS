import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Shield, Code2, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const team = [
//   {
//     name: "Kaif Khan",
//     role: "Full Stack Developer",
//     bio: "Specializing in building scalable distributed systems and high-performance web architectures with a focus on user experience.",
//     skills: ["React", "Node.js", "JavaScript", "MongoDB", "AI Integration", "Socket.io", "MERN Stack"],
//     social: { github: "https://github.com/kaifkhan-coder", linkedin: "https://linkedin.com/in/kaifkhan", email: "mailto:kaifkhancom551@gmail.com" }
//   }
];

const systemStats = [
  { label: "System Status", value: "Operational", icon: Cpu, color: "text-green-400" },
  { label: "Security Level", value: "Class-B", icon: Shield, color: "text-blue-400" },
  { label: "Build Version", value: "v2.0.4-stable", icon: Terminal, color: "text-[#05d9e8]" },
];

const CardWrapper = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#05d9e8] to-[#ff2a6d] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative bg-[#0b0b12] border border-white/10 rounded-lg p-6 leading-none flex flex-col">
      {children}
    </div>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-[#05d9e8] selection:text-black font-mono overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-[#05d9e8]" />
            <span className="text-[#05d9e8] tracking-widest text-sm uppercase">System Architecture</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            ABOUT_<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#05d9e8] to-[#ff2a6d]">THE_SYSTEM</span>
          </h1>
          <p className="max-w-2xl text-white/60 text-lg leading-relaxed">
            A high-performance digital environment engineered for scalability, speed, and 
            uncompromising reliability. Built to interface with modern web paradigms.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {systemStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <CardWrapper>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-md bg-white/5 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </CardWrapper>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Code2 className="text-[#ff2a6d]" />
              Core_Architects
            </h2>
            <div className="h-px flex-grow mx-8 bg-white/10 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardWrapper className="h-full">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-[#05d9e8]/20 to-[#ff2a6d]/20 border border-white/10 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white/20">{member.name.charAt(0)}</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-[#05d9e8]">{member.name}</h3>
                          <p className="text-[#ff2a6d] font-medium">{member.role}</p>
                        </div>
                        <div className="flex gap-3">
                          <a href="https://github.com/kaifkhan-coder" className="text-white/40 hover:text-[#05d9e8] transition-colors"><Github size={20} /></a>
                          <a href={member.social.linkedin} className="text-white/40 hover:text-[#05d9e8] transition-colors"><Linkedin size={20} /></a>
                          <a href="mailto:kaifkhancom551@gmail.com" className="text-white/40 hover:text-[#05d9e8] transition-colors"><Mail size={20} /></a>
                        </div>
                      </div>
                      
                      <p className="text-white/60 mb-6 leading-relaxed">
                        {member.bio}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {member.skills.map(skill => (
                          <span key={skill} className="px-3 py-1 text-xs rounded-full border border-[#05d9e8]/30 bg-[#05d9e8]/5 text-[#05d9e8]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-8 rounded-lg border border-[#05d9e8]/20 bg-gradient-to-b from-transparent to-[#05d9e8]/5 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h4 className="text-xl font-bold mb-1">Ready to initialize?</h4>
            <p className="text-white/50">Connect with the team for project inquiries.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
