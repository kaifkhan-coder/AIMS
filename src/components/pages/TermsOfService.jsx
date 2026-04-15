// export default function TermsOfService() {
//   return (
//     <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
//       <h1 className="text-4xl font-bold mb-6 text-[#05d9e8]">
//         Service Terms
//       </h1>

//       <p className="mb-6 text-white/70">
//         By accessing and using the Automated Incident Management System (AIMS),
//         you agree to comply with the following terms and conditions.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         1. User Responsibilities
//       </h2>
//       <p className="text-white/60">
//         Users must provide accurate information while creating incidents and must not misuse the platform.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         2. Account Security
//       </h2>
//       <p className="text-white/60">
//         You are responsible for maintaining the confidentiality of your account credentials.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         3. Acceptable Use
//       </h2>
//       <p className="text-white/60">
//         The system must not be used for malicious activities, spamming, or unauthorized access attempts.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         4. System Availability
//       </h2>
//       <p className="text-white/60">
//         We strive for 100% uptime, but we do not guarantee uninterrupted service due to maintenance or technical issues.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         5. Limitation of Liability
//       </h2>
//       <p className="text-white/60">
//         AIMS is not liable for any data loss, system downtime, or damages arising from system usage.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         6. Termination
//       </h2>
//       <p className="text-white/60">
//         Accounts may be suspended or terminated if users violate these terms.
//       </p>

//       <h2 className="text-xl font-semibold mt-8 mb-2 text-[#ff2a6d]">
//         7. Updates to Terms
//       </h2>
//       <p className="text-white/60">
//         We may update these terms at any time. Continued use of the system implies acceptance.
//       </p>
//     </div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0514] text-white px-6 py-10">
      
      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-lg"
      >
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
          Terms & Conditions
        </h1>

        <p className="text-slate-400 text-center mb-8 text-sm">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        {/* Sections */}
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account and using this platform, you agree to comply
              with and be bound by these Terms & Conditions. If you do not agree,
              you must not use this system.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              2. User Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information during registration.</li>
              <li>Maintain confidentiality of your login credentials.</li>
              <li>Do not misuse or attempt to hack the system.</li>
              <li>Use the platform only for intended purposes.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              3. Data & Privacy
            </h2>
            <p>
              Your data is stored securely and used only for system functionality.
              We do not share your personal information with third parties without
              consent, except when required by law.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              4. System Usage
            </h2>
            <p>
              This system is developed as part of an academic project. While we
              strive for accuracy and reliability, we do not guarantee uninterrupted
              or error-free service.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              5. Admin Rights
            </h2>
            <p>
              Administrators reserve the right to monitor, modify, or remove any
              content or user account that violates these terms.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              6. Limitation of Liability
            </h2>
            <p>
              We are not responsible for any data loss, damages, or issues arising
              from the use of this platform.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              7. Changes to Terms
            </h2>
            <p>
              These terms may be updated at any time without prior notice. Continued
              use of the platform means you accept the updated terms.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              8. Contact Information
            </h2>
            <p>
              For any questions or concerns regarding these Terms & Conditions,
              please contact the system administrator.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-500 border-t border-white/10 pt-4">
          © {new Date().getFullYear()} AIMS. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}
