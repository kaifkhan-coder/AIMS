import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <motion.div
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-800 text-white h-screen p-4"
    >
      <h2 className="text-xl font-bold mb-4">AIMS</h2>
      <nav className="space-y-2">
        <Link to="/admin">Dashboard</Link>
        <Link to="/create-staff">Create Staff</Link>
        <Link to="/incidents">Incidents</Link>
      </nav>
    </motion.div>
  );
}
