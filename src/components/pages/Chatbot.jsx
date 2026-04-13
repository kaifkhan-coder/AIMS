import { useState } from "react";
import api from "../../services/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showTicketBtn, setShowTicketBtn] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await api.post("/chatbot/chat", {
      message: input,
      userId: user?.id // Replace with actual user ID from auth context
    });

    if (res.data.type === "solution") {
      res.data.solutions.forEach(sol => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: sol.title },
          ...sol.steps.map(step => ({ sender: "bot", text: "👉 " + step }))
        ]);
      });
    }

    if (res.data.type === "ai") {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: res.data.answer }
      ]);

      if (res.data.askTicket) {
        setShowTicketBtn(true);
        setLastMessage(input);
      }
    }

    setInput("");
  };

  const createTicket = async () => {
    const res = await api.post("/chatbot/create-ticket", {
      message: lastMessage,
      userId: user?.id
    });

    setMessages(prev => [
      ...prev,
      { sender: "bot", text: `🎫 Ticket Created: ${res.data.ticketId}` }
    ]);

    setShowTicketBtn(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-black border border-[#05d9e8] p-4">
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <p key={i} className={msg.sender === "user" ? "text-right text-[#ff2a6d]" : "text-left text-[#05d9e8]"}>
            {msg.text}
          </p>
        ))}
      </div>

      {showTicketBtn && (
        <button onClick={createTicket} className="w-full bg-yellow-500 mb-2">
          Create Ticket 🎫
        </button>
      )}

      <div className="flex">
        <input
          className="flex-1 p-2 bg-black border border-[#05d9e8]/20"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="px-3 bg-[#05d9e8] text-black">
          Send
        </button>
      </div>
    </div>
  );
}