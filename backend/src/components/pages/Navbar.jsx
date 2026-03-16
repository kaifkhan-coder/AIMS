import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="h-14 bg-white shadow flex justify-between px-6 items-center">
      <span className="font-bold">Welcome {user?.username}</span>
      <button onClick={logout} className="text-red-500">Logout</button>
    </div>
  );
}
