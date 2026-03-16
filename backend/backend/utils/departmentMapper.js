export const getDepartmentByCategory = (category) => {
  switch (category?.toLowerCase()) {
    case "network":
    case "internet":
      return "NETWORK";

    case "hardware":
    case "software":
      return "IT";

    case "salary":
    case "leave":
      return "HR";

    case "billing":
    case "payment":
      return "FINANCE";

    default:
      return "IT"; // fallback
  }
};
