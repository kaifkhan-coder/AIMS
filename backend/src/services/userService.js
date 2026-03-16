import axios from "axios";

export const createStaff = (data) => {
    const token = localStorage.getItem("token");
  return axios.post(
    "http://localhost:5000/api/admin/create-staff",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
};

axios.get("http://localhost:5000/api/dashboard/admin", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

axios.get("http://localhost:5000/api/dashboard/staff", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

await axios.post(
  "http://localhost:5000/api/tickets",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

await axios.post(
    "http://localhost:5000/api/tickets/my",
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
  return axios.get("http://localhost:5000/api/admin/tickets/assigned", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
} 