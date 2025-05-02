// Define all API endpoints here

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/sound-store/users/login",
    ME: "/api/sound-store/users/me",
  },
  USERS: {
    GET_ALL: "/api/sound-store/users",
    GET_BY_ID: (id: string) => `/api/sound-store/users/${id}`,
  },
  CATEGORIES: {
    GET_BY_ID: (id: number) => `/api/sound-store/category/${id}`,
    PAGINATED: (pageNumber: number, pageSize: number) =>
      `/api/sound-store/categories/pageNumber/${pageNumber}/pageSize/${pageSize}`,
    CREATE: "/api/sound-store/categories",
    UPDATE: (id: number) => `/api/sound-store/categories/${id}`,
    DELETE: (id: number) => `/api/sound-store/categories/${id}`,
  },
  PRODUCTS: {},
  CUSTOMERS: {},
};
