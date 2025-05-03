import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Eye } from "lucide-react";
import { useCategories } from "@/hooks/categories";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AddCategoryDialog } from "@/components/categories/AddCategoryDialog";
import { useCallback } from "react";

const Categories = () => {
  const { categories, loading, error, fetchCategories } = useCategories();

  const handleCategoryAdded = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if the date is valid before formatting
      if (isNaN(date.getTime())) return "";
      return format(date, "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex justify-end">
          <AddCategoryDialog onCategoryAdded={handleCategoryAdded} />
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableCaption>
              A list of all Marshall product categories.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-right">
                  Created At
                </TableHead>
                <TableHead className="w-[150px] text-right">
                  Updated At
                </TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {category.description?.length > 50
                        ? `${category.description.substring(0, 50)}...`
                        : category.description || ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(category.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {category.updatedAt ? formatDate(category.updatedAt) : ""}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-0 h-8 w-8"
                      >
                        <Link to={`/categories/${category.id}`}>
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
        </div>
      )}
    </div>
  );
};

export default Categories;
