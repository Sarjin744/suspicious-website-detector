export const logoutUser = (navigate) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
};
