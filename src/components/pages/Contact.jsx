import { useState } from "react";
import axios from "axios";
import api from "../../services/api.js";
export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/contact", form);
      alert("Message sent successfully ✅");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Failed to send ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
      <h1 className="text-4xl text-[#05d9e8] mb-6">Contact_Us</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 bg-black border border-[#05d9e8]/20"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-black border border-[#05d9e8]/20"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          placeholder="Message"
          className="w-full p-3 bg-black border border-[#05d9e8]/20"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <a
  href="https://wa.me/9326865425"
  target="_blank"
  className="fixed bottom-20 right-6 bg-green-500 text-white px-4 py-2 rounded-full z-50"
>
  Chat on WhatsApp
</a>
        <button className="bg-[#ff2a6d] px-6 py-3">Send_Message</button>
      </form>
    </div>
  );
}