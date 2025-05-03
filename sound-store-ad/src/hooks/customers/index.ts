import { useState, useEffect, useCallback } from "react";
import { ENDPOINTS, buildApiUrl } from "@/apis";

export enum UserState {
  Actived = 1,
  Inactived = 2,
  Deleted = 3,
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  email: string;
  dateOfBirth: string;
  status: string;
}

export interface PaginatedResponse<T> {
  isSuccess: boolean;
  message: string;
  value: {
    items: T[];
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (
      page = paginationInfo.currentPage,
      size = paginationInfo.pageSize
    ) => {
      try {
        setLoading(true);
        const endpoint = ENDPOINTS.USERS.PAGINATED_CUSTOMERS(page, size);
        const response = await fetch(buildApiUrl(endpoint));

        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }

        const data: PaginatedResponse<Customer> = await response.json();

        if (data.isSuccess) {
          setCustomers(data.value.items);
          setPaginationInfo({
            currentPage: data.value.pageNumber,
            pageSize: data.value.pageSize,
            totalItems: data.value.totalItems,
            totalPages: data.value.totalPages,
            hasPreviousPage: data.value.hasPreviousPage,
            hasNextPage: data.value.hasNextPage,
          });
          setError(null);
        } else {
          setError(data.message || "Failed to load customers");
        }
      } catch (error) {
        setError("Failed to load customers. Please try again later.");
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    },
    [paginationInfo.currentPage, paginationInfo.pageSize]
  );

  const getCustomer = useCallback(
    async (id: string): Promise<Customer | null> => {
      try {
        const endpoint = ENDPOINTS.USERS.GET_CUSTOMER_BY_ID(id);
        const response = await fetch(buildApiUrl(endpoint));

        if (!response.ok) {
          throw new Error(`Failed to fetch customer: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.isSuccess) {
          return data.value;
        } else {
          console.error("Error fetching customer:", data.message);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching customer with id ${id}:`, error);
        return null;
      }
    },
    []
  );

  const changePage = (page: number) => {
    if (page > 0 && page <= paginationInfo.totalPages) {
      setPaginationInfo((prev) => ({ ...prev, currentPage: page }));
    }
  };

  const changePageSize = (size: number) => {
    if (size > 0) {
      setPaginationInfo((prev) => ({
        ...prev,
        pageSize: size,
        currentPage: 1,
      }));
    }
  };

  // Helper function to get user status label from status string
  const getUserStatusLabel = (status: string): string => {
    switch (status) {
      case "1":
      case "Actived":
        return "Active";
      case "2":
      case "Inactived":
        return "Inactive";
      case "3":
      case "Deleted":
        return "Deleted";
      default:
        return "Unknown";
    }
  };

  // Helper function to get full name from first and last name
  const getFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  };

  useEffect(() => {
    fetchCustomers();
  }, [paginationInfo.currentPage, paginationInfo.pageSize, fetchCustomers]);

  return {
    customers,
    paginationInfo,
    loading,
    error,
    fetchCustomers,
    getCustomer,
    changePage,
    changePageSize,
    getUserStatusLabel,
    getFullName,
  };
}
