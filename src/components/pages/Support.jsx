import { useState } from "react";

const faqs = [
  {
    q: "Ticket not updating?",
    a: "Try refreshing or re-login."
  },
  {
    q: "Not receiving notifications?",
    a: "Check your email settings."
  },
  {
    q: "Unable to login?",
    a: "Reset password or contact admin."
  }
];

export default function Support() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
      <h1 className="text-4xl text-[#05d9e8] mb-8">Support_Net</h1>

      {faqs.map((item, i) => (
        <div key={i} className="border-b border-[#05d9e8]/20 py-4">
          <div
            onClick={() => setOpen(open === i ? null : i)}
            className="cursor-pointer text-[#ff2a6d]"
          >
            {item.q}
          </div>

          {open === i && (
            <p className="text-white/60 mt-2">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}