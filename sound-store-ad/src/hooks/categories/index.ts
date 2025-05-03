import { useState, useEffect, useCallback } from "react";
import { ENDPOINTS, buildApiUrl } from "@/apis";

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  subCategories: SubCategory[];
  createdAt: string;
  updatedAt: string | null;
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

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchCategories = useCallback(
    async (
      page = paginationInfo.currentPage,
      size = paginationInfo.pageSize
    ) => {
      try {
        setLoading(true);
        const endpoint = ENDPOINTS.CATEGORIES.PAGINATED(page, size);
        const response = await fetch(buildApiUrl(endpoint));

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        const data: PaginatedResponse<Category> = await response.json();

        if (data.isSuccess) {
          // Sanitize date fields to ensure valid dates
          const sanitizedCategories = data.value.items.map((category) => ({
            ...category,
            // Ensure createdAt date string is valid or set to current date
            createdAt: isValidDateString(category.createdAt)
              ? category.createdAt
              : new Date().toISOString(),
            // Keep updatedAt as null if it doesn't exist or is not valid
            updatedAt: isValidDateString(category.updatedAt)
              ? category.updatedAt
              : null,
          }));

          setCategories(sanitizedCategories);
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
          setError(data.message || "Failed to load categories");
        }
      } catch (error) {
        setError("Failed to load categories. Please try again later.");
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    },
    [paginationInfo.currentPage, paginationInfo.pageSize]
  );

  const getCategory = async (id: number): Promise<Category | null> => {
    try {
      const endpoint = ENDPOINTS.CATEGORIES.GET_BY_ID(id);
      const response = await fetch(buildApiUrl(endpoint));

      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.statusText}`);
      }

      const category = await response.json();

      // Sanitize dates
      return {
        ...category,
        createdAt: isValidDateString(category.createdAt)
          ? category.createdAt
          : new Date().toISOString(),
        updatedAt: isValidDateString(category.updatedAt)
          ? category.updatedAt
          : null,
      };
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      return null;
    }
  };

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

  const createCategory = async (
    name: string,
    description?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const endpoint = ENDPOINTS.CATEGORIES.CREATE;
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || "",
        }),
      });

      const data = await response.json();

      if (data.isSuccess) {
        // Don't call fetchCategories here since we'll do it from the component
        return {
          success: true,
          message: data.message ?? "Category created successfully",
        };
      } else {
        return {
          success: false,
          message: data.message ?? "Failed to create category",
        };
      }
    } catch (error) {
      console.error("Error creating category:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  };

  // Helper function to check if a date string is valid
  function isValidDateString(dateString: string | null | undefined): boolean {
    if (!dateString) return false;

    // Try to create a date object and check if it's valid
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  useEffect(() => {
    fetchCategories();
  }, [paginationInfo.currentPage, paginationInfo.pageSize, fetchCategories]);

  return {
    categories,
    paginationInfo,
    loading,
    error,
    fetchCategories,
    getCategory,
    changePage,
    changePageSize,
    createCategory,
  };
}
