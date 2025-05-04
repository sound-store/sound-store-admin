import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/products";
import { Pagination } from "@/components/ui/pagination";
import { useEffect } from "react";

export default function Products() {
  const { products, loading, error, page, handlePageChange } = useProducts();

  // Debug logging to help troubleshoot
  useEffect(() => {
    console.log("Products data:", products);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [products, loading, error]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "InStock":
        return "In Stock";
      case "OutOfStock":
        return "Out of Stock";
      case "Discontinued":
        return "Discontinued";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "InStock":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "OutOfStock":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "Discontinued":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link to="/product/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="h-[200px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableCaption>A list of all Marshall products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!products || products.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.items.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>{product.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={`/product/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {product.description.length > 40
                        ? `${product.description.substring(0, 40)}...`
                        : product.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stockQuantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-0 h-8 w-8"
                      >
                        <Link to={`/product/${product.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {products && products.totalPages > 1 && (
            <div className="mt-6">
              <div className="flex justify-center mb-2">
                <Pagination
                  currentPage={page}
                  totalPages={products.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Showing {products.items.length} of {products.totalItems}{" "}
                products (Page {page} of {products.totalPages})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
