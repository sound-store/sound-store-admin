import { useState, useEffect } from "react";
import { ENDPOINTS } from "../../apis/endpoints";
import axios from "axios";
import { buildApiUrl } from "../../apis";

export enum ProductState {
  InStock = 1,
  OutOfStock = 2,
  Discontinued = 3,
}

export interface ProductImage {
  imageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  stockQuantity: number;
  price: number;
  type: string;
  connectivity: string;
  specialFeatures: string;
  frequencyResponse: string;
  sensitivity: string;
  batteryLife: string;
  accessoriesIncluded: string;
  warranty: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  status: string;
  images: ProductImage[];
}

export interface ProductsResponse {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Product[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  value: T;
}

export const useProducts = (initialPage = 1, pageSize = 10) => {
  const [products, setProducts] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);

  const fetchProducts = async (pageNumber: number, size: number) => {
    try {
      setLoading(true);
      // Get the authentication token from session storage
      const token = sessionStorage.getItem("auth-token");

      const response = await axios.get<ApiResponse<ProductsResponse>>(
        buildApiUrl(ENDPOINTS.PRODUCTS.PAGINATED(pageNumber, size)),
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
      );

      if (response.data.isSuccess) {
        setProducts(response.data.value);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch products");
        console.error("API Error:", response.data.message);
      }
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, pageSize);
  }, [page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    products,
    loading,
    error,
    page,
    handlePageChange,
    refetch: () => fetchProducts(page, pageSize),
  };
};
