const team = [
  { name: "Kaif Khan", role: "Full Stack Developer" },
  { name: "Team Member 2", role: "Backend Developer" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#020205] text-white px-6 py-20">
      <h1 className="text-4xl text-[#05d9e8] mb-8">About_The_System</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {team.map((member, i) => (
          <div key={i} className="border border-[#05d9e8]/20 p-6">
            <h2 className="text-[#ff2a6d] text-xl">{member.name}</h2>
            <p className="text-white/60">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}