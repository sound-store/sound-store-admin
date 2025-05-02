// Define all API endpoints here

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/sound-store/users/login",
  },
  USERS: {
    GET_ALL: "/api/sound-store/users",
    GET_BY_ID: (id: string) => `/api/sound-store/users/${id}`,
  },
  // Add more endpoint categories as needed
};
