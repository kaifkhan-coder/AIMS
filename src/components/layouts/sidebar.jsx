import { motion } from "framer-motion";
import useAuth from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 text-white min-h-screen p-4"
    >
      <h2 className="text-xl mb-6">AIMS</h2>

      {user.role === "admin" && <p>Admin Panel</p>}
      {user.role === "staff" && <p>Assigned Tickets</p>}
      {user.role === "user" && <p>Create Incident</p>}
    </motion.div>
  );
};

export default Sidebar;
