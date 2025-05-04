import { useParams, Link, useNavigate } from "react-router-dom";
import { useProductDetail, deleteProduct } from "@/hooks/products";
import { Loader2, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProductDetail(id ?? "");
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Product detail data:", product);
  }, [product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "InStock":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            In Stock
          </Badge>
        );
      case "OutOfStock":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Out of Stock
          </Badge>
        );
      case "Discontinued":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Discontinued
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    console.log("Edit product:", product?.id);
    // Implement edit functionality or navigation to edit page
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      const result = await deleteProduct(product.id);

      if (result.success) {
        alert("Product deleted successfully");
        // Navigate back to products page
        navigate("/products");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("An unexpected error occurred while deleting the product");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <div className="py-10 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" size="sm" className="mb-6" asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <div className="h-[400px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" size="sm" className="mb-6" asChild>
        <Link to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Image and Action Buttons */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-full flex justify-center mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.name}
                  className="rounded-md max-h-64 object-contain"
                />
              ) : (
                <div className="w-full h-52 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 border-t">
            <Button
              variant="outline"
              className="flex-1 mr-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </CardFooter>
        </Card>

        {/* Product Info */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="mt-2">
                  {product.description}
                </CardDescription>
              </div>
              <div>{getStatusBadge(product.status)}</div>
            </div>
            <div className="mt-3 text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Product Details</h3>
                <Separator className="my-2" />
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Category</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Subcategory</TableCell>
                      <TableCell>{product.subCategoryName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Type</TableCell>
                      <TableCell>{product.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Stock Quantity
                      </TableCell>
                      <TableCell>{product.stockQuantity}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-medium">
                  Technical Specifications
                </h3>
                <Separator className="my-2" />
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Connectivity
                      </TableCell>
                      <TableCell>{product.connectivity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Special Features
                      </TableCell>
                      <TableCell>{product.specialFeatures}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Frequency Response
                      </TableCell>
                      <TableCell>{product.frequencyResponse}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sensitivity</TableCell>
                      <TableCell>{product.sensitivity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Battery Life
                      </TableCell>
                      <TableCell>{product.batteryLife}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-medium">Warranty & Accessories</h3>
                <Separator className="my-2" />
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Warranty</TableCell>
                      <TableCell>{product.warranty}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Accessories Included
                      </TableCell>
                      <TableCell>{product.accessoriesIncluded}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{product.name}" and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
