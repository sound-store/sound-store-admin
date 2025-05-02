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
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/categories";

const Categories = () => {
  const { categories, loading, error } = useCategories();

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
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                      {formatDate(category.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {category.updatedAt ? formatDate(category.updatedAt) : ""}
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
