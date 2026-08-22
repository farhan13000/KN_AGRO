import { BACKEND_ROLES } from "../shared/constants";
import { setAccessToken } from "../core/api";

const mockUser = {
  _id: "mock-user-super-admin",
  name: "Mock Super Admin",
  email: "admin@example.com",
  status: "active",
  role: {
    name: BACKEND_ROLES.SUPER_ADMIN,
    permissions: ["*"],
  },
};

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 250));

export const mockAuthApi = {
  async login({ email, password }) {
    await wait();

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const accessToken = "mock-access-token";
    setAccessToken(accessToken);

    return {
      user: mockUser,
      accessToken,
    };
  },

  async logout() {
    await wait();
    setAccessToken(null);
    return null;
  },

  async refreshSession() {
    await wait();
    const accessToken = "mock-access-token";
    setAccessToken(accessToken);
    return { accessToken };
  },

  async getCurrentUser() {
    await wait();
    return mockUser;
  },

  async changePassword() {
    await wait();
    setAccessToken(null);
    return null;
  },
};

