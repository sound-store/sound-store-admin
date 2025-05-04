import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const AddProduct = () => {
  const navigate = useNavigate();
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
  });
  const [images, setImages] = useState<File[]>([]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);

      // Clear image validation error if it exists
      if (validationErrors["images"]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors["images"];
          return newErrors;
        });
      }
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

    if (images.length === 0) {
      setValidationErrors((prev) => ({
        ...prev,
        images: ["Please upload at least one image"],
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

      // Create FormData object
      const productData = new FormData();

      // Add text fields
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("stockQuantity", formData.stockQuantity);
      productData.append("price", formData.price);
      productData.append("type", formData.type);
      productData.append("connectivity", formData.connectivity);
      productData.append("specialFeatures", formData.specialFeatures);
      productData.append("frequencyResponse", formData.frequencyResponse);
      productData.append("sensitivity", formData.sensitivity);
      productData.append("batteryLife", formData.batteryLife);
      productData.append("accessoriesIncluded", formData.accessoriesIncluded);
      productData.append("warranty", formData.warranty);
      productData.append("subCategoryId", selectedSubCategoryId);

      // Add images
      for (const element of images) {
        productData.append("images", element);
      }

      // Send request
      const response = await fetch(buildApiUrl(ENDPOINTS.PRODUCTS.CREATE), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productData,
      });

      const result = await response.json();

      if (result.isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/products");
        }, 2000);
      } else {
        // Check if result contains validation errors (object with field names as keys)
        if (
          result.errors &&
          typeof result.errors === "object" &&
          !Array.isArray(result.errors)
        ) {
          setValidationErrors(result.errors);
        } else {
          setError(result.message ?? "Failed to create product");
        }
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError("An error occurred while creating the product");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/products");
  };

  // Helper function to display field error
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-red-500 text-xs mt-1">
        {validationErrors[fieldName][0]}
      </p>
    ) : null;
  };

  return (
    <div className="py-10 px-4">
      <Button variant="outline" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Product</CardTitle>
            <CardDescription>
              Create a new product with detailed information
            </CardDescription>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2 py-3">
                  <Label htmlFor="images">
                    Product Images <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={`border-2 border-dashed ${
                      validationErrors["images"]
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-4 transition-colors hover:border-primary/50 focus-within:border-primary relative`}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <div className="text-center">
                      <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                          <line x1="16" y1="5" x2="22" y2="5"></line>
                          <line x1="19" y1="2" x2="19" y2="8"></line>
                          <circle cx="9" cy="9" r="2"></circle>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-medium">
                        {images.length > 0 ? "Change files" : "Choose files"} or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload one or more images of the product (max 5MB each)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {getFieldError("images")}
                  {images.length > 0 && (
                    <div className="mt-4 border rounded-lg p-3 bg-muted/20">
                      <p className="text-sm font-medium mb-2">
                        {images.length} file(s) selected:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {images.map((file, index) => (
                          <li key={index} className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 text-primary"
                            >
                              <path d="M5 3h14"></path>
                              <path d="M17 21H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4Z"></path>
                              <circle cx="12" cy="11" r="3"></circle>
                            </svg>
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
                  Product created successfully! Redirecting...
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
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;
