const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

useEffect(() => {
  if (!socketRef.current) return;

  const s = socketRef.current;

  const push = (n) => {
    setNotifications((prev) => [n, ...prev].slice(0, 20));
    toast.success(n.message || "New notification");
  };

  s.on("notification", push);
  s.on("ticket_created", () => push({ message: "New ticket created" }));
  s.on("ticket_assigned", () => push({ message: "Ticket assigned" }));
  s.on("sla_breach", (data) => push({ message: `SLA breached: ${data.title}` }));

  return () => {
    s.off("notification", push);
    s.off("ticket_created");
    s.off("ticket_assigned");
    s.off("sla_breach");
  };
}, []);
