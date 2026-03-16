import { motion } from "framer-motion";
import { updateStaff } from "../../services/adminService";
import { useState } from "react";

const EditStaff = ({ staff, onClose, onSuccess }: any) => {
  const [form, setForm] = useState(staff);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await updateStaff(staff._id, form);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.form
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-700"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-bold mb-4">Edit Staff</h3>

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <input
          className="w-full mb-3 p-2 bg-slate-800 rounded"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} type="button">Cancel</button>
          <button className="bg-indigo-500 px-4 py-2 rounded">
            Save
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditStaff;
