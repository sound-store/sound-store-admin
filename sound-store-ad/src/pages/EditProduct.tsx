import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ENDPOINTS, buildApiUrl } from "@/apis";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductDetail, updateProduct } from "@/hooks/products";

// Define types for category and subcategory
interface Category {
  id: number;
  name: string;
  description?: string;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
}

interface ValidationErrors {
  [key: string]: string[];
}

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    product,
    loading: productLoading,
    error: productError,
  } = useProductDetail(Number(id));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stockQuantity: "0",
    price: "0",
    type: "",
    connectivity: "",
    specialFeatures: "",
    frequencyResponse: "",
    sensitivity: "",
    batteryLife: "",
    accessoriesIncluded: "",
    warranty: "",
    status: "InStock",
  });

  // Load product data when available
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        stockQuantity: product.stockQuantity.toString(),
        price: product.price.toString(),
        type: product.type || "",
        connectivity: product.connectivity || "",
        specialFeatures: product.specialFeatures || "",
        frequencyResponse: product.frequencyResponse || "",
        sensitivity: product.sensitivity || "",
        batteryLife: product.batteryLife || "",
        accessoriesIncluded: product.accessoriesIncluded || "",
        warranty: product.warranty || "",
        status: product.status || "InStock",
      });

      if (product.categoryId) {
        setSelectedCategoryId(product.categoryId.toString());
      }

      if (product.subCategoryId) {
        setSelectedSubCategoryId(product.subCategoryId.toString());
      }
    }
  }, [product]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("auth-token");
        const response = await fetch(
          buildApiUrl(ENDPOINTS.CATEGORIES.PAGINATED(1, 100)),
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );
        const data = await response.json();
        if (data.isSuccess) {
          setCategories(data.value.items);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category is selected
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const token = sessionStorage.getItem("auth-token");
        const response = await fetch(
          buildApiUrl(
            ENDPOINTS.CATEGORIES.GET_BY_ID(Number(selectedCategoryId))
          ),
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          }
        );
        const data = await response.json();
        if (data.isSuccess && data.value.subCategories) {
          setSubCategories(data.value.subCategories);
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };

    fetchSubCategories();
  }, [selectedCategoryId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    setSelectedSubCategoryId(""); // Reset subcategory when changing category

    // Clear category validation errors
    if (validationErrors["categoryId"] || validationErrors["subCategoryId"]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["categoryId"];
        delete newErrors["subCategoryId"];
        return newErrors;
      });
    }
  };

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategoryId(value);

    // Clear subcategory validation error
    if (validationErrors["subCategoryId"]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["subCategoryId"];
        return newErrors;
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));

    if (validationErrors["status"]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["status"];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setValidationErrors({});

    if (!selectedSubCategoryId) {
      setValidationErrors((prev) => ({
        ...prev,
        subCategoryId: ["Please select a subcategory"],
      }));
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("auth-token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Create JSON data object
      const productData = {
        name: formData.name,
        description: formData.description,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        price: parseInt(formData.price, 10),
        type: formData.type,
        connectivity: formData.connectivity,
        specialFeatures: formData.specialFeatures,
        frequencyResponse: formData.frequencyResponse,
        sensitivity: formData.sensitivity,
        batteryLife: formData.batteryLife,
        accessoriesIncluded: formData.accessoriesIncluded,
        warranty: formData.warranty,
        subCategoryId: parseInt(selectedSubCategoryId, 10),
        status: formData.status,
      };

      // Send request
      const result = await updateProduct(Number(id), productData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/product/${id}`);
        }, 2000);
      } else {
        // Check if result contains validation errors
        if (result.errors && typeof result.errors === "object") {
          setValidationErrors(result.errors);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError("An error occurred while updating the product");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/product/${id}`);
  };

  // Helper function to display field error
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-red-500 text-xs mt-1">
        {validationErrors[fieldName][0]}
      </p>
    ) : null;
  };

  if (productLoading) {
    return (
      <div className="py-10 px-4">
        <Button variant="outline" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="h-[400px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="py-10 px-4">
        <Button
          variant="outline"
          onClick={() => navigate("/products")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <div className="text-center text-red-500">{productError}</div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <Button variant="outline" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product Details
      </Button>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Product</CardTitle>
            <CardDescription>Update product information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={
                        validationErrors["name"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("name")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price (VND) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className={
                        validationErrors["price"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("price")}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className={
                      validationErrors["description"] ? "border-red-500" : ""
                    }
                  />
                  {getFieldError("description")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger
                        className={
                          validationErrors["categoryId"] ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError("categoryId")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategoryId">
                      Subcategory <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedSubCategoryId}
                      onValueChange={handleSubCategoryChange}
                      disabled={!selectedCategoryId}
                    >
                      <SelectTrigger
                        className={
                          validationErrors["subCategoryId"]
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCategory) => (
                          <SelectItem
                            key={subCategory.id}
                            value={subCategory.id.toString()}
                          >
                            {subCategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError("subCategoryId")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">
                      Stock Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      required
                      className={
                        validationErrors["stockQuantity"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getFieldError("stockQuantity")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger
                        className={
                          validationErrors["status"] ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InStock">In Stock</SelectItem>
                        <SelectItem value="OutOfStock">Out of Stock</SelectItem>
                        <SelectItem value="Discontinued">
                          Discontinued
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError("status")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={
                        validationErrors["type"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("type")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connectivity">Connectivity</Label>
                    <Input
                      id="connectivity"
                      name="connectivity"
                      value={formData.connectivity}
                      onChange={handleInputChange}
                      className={
                        validationErrors["connectivity"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("connectivity")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialFeatures">Special Features</Label>
                    <Input
                      id="specialFeatures"
                      name="specialFeatures"
                      value={formData.specialFeatures}
                      onChange={handleInputChange}
                      className={
                        validationErrors["specialFeatures"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getFieldError("specialFeatures")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequencyResponse">
                      Frequency Response
                    </Label>
                    <Input
                      id="frequencyResponse"
                      name="frequencyResponse"
                      value={formData.frequencyResponse}
                      onChange={handleInputChange}
                      className={
                        validationErrors["frequencyResponse"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getFieldError("frequencyResponse")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Sensitivity</Label>
                    <Input
                      id="sensitivity"
                      name="sensitivity"
                      value={formData.sensitivity}
                      onChange={handleInputChange}
                      className={
                        validationErrors["sensitivity"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("sensitivity")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batteryLife">Battery Life</Label>
                    <Input
                      id="batteryLife"
                      name="batteryLife"
                      value={formData.batteryLife}
                      onChange={handleInputChange}
                      className={
                        validationErrors["batteryLife"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("batteryLife")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessoriesIncluded">
                      Accessories Included
                    </Label>
                    <Input
                      id="accessoriesIncluded"
                      name="accessoriesIncluded"
                      value={formData.accessoriesIncluded}
                      onChange={handleInputChange}
                      className={
                        validationErrors["accessoriesIncluded"]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {getFieldError("accessoriesIncluded")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleInputChange}
                      className={
                        validationErrors["warranty"] ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("warranty")}
                  </div>
                </div>

                {product?.images && product.images.length > 0 && (
                  <div className="mt-4 mb-4 border p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Current images:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative w-20 h-20 border rounded overflow-hidden"
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Image updates are currently not supported
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
                  Product updated successfully! Redirecting...
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleGoBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default EditProduct;
