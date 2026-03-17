import axios from "axios";

export const createStaff = (data) => {
    const token = localStorage.getItem("token");
  return axios.post(
    "${process.env.BACKEND_URL}/api/admin/create-staff",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
};

axios.get("${process.env.BACKEND_URL}/api/dashboard/admin", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

axios.get("${process.env.BACKEND_URL}/api/dashboard/staff", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

await axios.post(
  "${process.env.BACKEND_URL}/api/tickets",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

await axios.post(
    "${process.env.BACKEND_URL}/api/tickets/my",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
)

export const getAssignedTickets = () => {
  const token = localStorage.getItem("token");
  return axios.get("${process.env.BACKEND_URL}/api/admin/tickets/assigned", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
} 