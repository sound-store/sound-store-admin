import { useParams, Link } from "react-router-dom";
import { useProductDetail } from "@/hooks/products";
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
import { useEffect } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProductDetail(id ?? "");

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

  const handleDelete = () => {
    console.log("Delete product:", product?.id);
    // Implement delete functionality with confirmation
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
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
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
    </div>
  );
}
