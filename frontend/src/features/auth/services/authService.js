const BASE_URL = "http://localhost:8080";

const checkAuth = async () => {
  const response = await fetch(`${BASE_URL}/auth/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
};

const logout = async () => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
};

export const authService = {
  checkAuth,
  logout,
};
