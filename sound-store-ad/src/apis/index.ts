import { API_CONFIG } from "./config";
import { ENDPOINTS } from "./endpoints";

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export { API_CONFIG, ENDPOINTS };
