// Define all API endpoints here

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/sound-store/users/login",
    ME: "/api/sound-store/users/me",
  },
  USERS: {
    PAGINATED_CUSTOMERS: (pageNumber: number, pageSize: number) =>
      `/api/sound-store/customers/pageNumber/${pageNumber}/pageSize/${pageSize}`,
    GET_CUSTOMER_BY_ID: (id: string) => `/api/sound-store/customers/${id}`,
    UPDATE_CUSTOMER_STATUS: (id: string) => `/api/sound-store/customer/${id}`,
  },
  CATEGORIES: {
    GET_BY_ID: (id: number) => `/api/sound-store/categories/${id}`,
    PAGINATED: (pageNumber: number, pageSize: number) =>
      `/api/sound-store/categories/pageNumber/${pageNumber}/pageSize/${pageSize}`,
    CREATE: "/api/sound-store/category",
    UPDATE: (id: number) => `/api/sound-store/category/${id}`,
    DELETE: (id: number) => `/api/sound-store/category/${id}`,
  },
  PRODUCTS: {
    PAGINATED: (pageNumber: number, pageSize: number) =>
      `/api/sound-store/products/pageNumber/${pageNumber}/pageSize/${pageSize}`,
    GET_BY_ID: (id: number) => `/api/sound-store/products/${id}`,
    CREATE: "/api/sound-store/product",
    UPDATE: (id: number) => `/api/sound-store/product/${id}`,
    DELETE: (id: number) => `/api/sound-store/product/${id}`,
  },
};
