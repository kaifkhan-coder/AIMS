import axios from "axios";
const API = "${process.env.BACKEND_URL}/api/admin";

export const createStaff = (data) => {
  // console.log("Creating staff with data:", data);
  const token = localStorage.getItem("token");

  return axios.post(`${API}/create-staff`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getStaffList = () => {
  const token = localStorage.getItem("token");

  return axios.get(`${API}/staff`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteStaff = (id) => {
  const token = localStorage.getItem("token");

  return axios.delete(
    `${process.env.BACKEND_URL}/api/admin/staff/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// export const updateStaff = (id, data) =>
//   axios.put(`/api/admin/staff/${id}`, data);
export const updateStaff = (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(
    `${process.env.BACKEND_URL}/api/admin/staff/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
export const getAssignedTickets = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/assigned`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
export const reassignDepartment = (id, department) => {
  const token = localStorage.getItem("token");
  return axios.post(
    `${API}/reassign-department/${id}`,
    { department
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

