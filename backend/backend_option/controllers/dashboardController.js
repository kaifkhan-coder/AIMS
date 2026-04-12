export const adminDashboard = (req, res) => {
  res.json({
    message: "Admin dashboard data",
    user: req.user
  });
};

export const staffDashboard = (req, res) => {
  res.json({
    message: "Staff dashboard data",
    user: req.user
  });
};
