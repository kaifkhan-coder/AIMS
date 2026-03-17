import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminStaffList() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "${process.env.BACKEND_URL}/api/admin/staff",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaff(res.data);
    };
    fetchStaff();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Staff Members</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {staff.map(user => (
            <tr key={user._id} className="border-t">
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td>
                {user.isVerified ? (
                  <span className="text-green-600 font-semibold">✔ Verified</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
