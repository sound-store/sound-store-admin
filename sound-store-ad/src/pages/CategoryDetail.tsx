import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ENDPOINTS, buildApiUrl } from "@/apis";
import { Category } from "@/hooks/categories";
import { format } from "date-fns";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Helper function to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Category information display component
const CategoryInfo = ({ category }: { category: Category }) => (
  <Card className="w-full max-w-3xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl">
        {category.name || "Unnamed Category"}
      </CardTitle>
      <CardDescription>Category ID: {category.id}</CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Description</h3>
        <p className="text-muted-foreground mt-1">
          {category.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium">Created At</h3>
          <p className="text-muted-foreground">
            {formatDate(category.createdAt) || "Not available"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Last Updated</h3>
          <p className="text-muted-foreground">
            {category.updatedAt
              ? formatDate(category.updatedAt)
              : "Never updated"}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Edit dialog component
const EditDialog = ({
  isOpen,
  setIsOpen,
  name,
  setName,
  description,
  setDescription,
  onUpdate,
  isUpdating,
  message,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  message: string | null;
}) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button variant="outline">
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>
          Make changes to the category information.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {message && (
        <div
          className={`text-sm ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <DialogFooter>
        <Button type="submit" onClick={onUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Delete dialog component
const DeleteDialog = ({
  isOpen,
  setIsOpen,
  categoryName,
  onDelete,
  isDeleting,
  message,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  categoryName: string;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
  message: string | null;
}) => (
  <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the
          category "{categoryName}" and all associated data.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {message && (
        <div
          className={`text-sm my-2 ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const endpoint = ENDPOINTS.CATEGORIES.GET_BY_ID(Number(id));
        const response = await fetch(buildApiUrl(endpoint));

        if (!response.ok) {
          throw new Error(`Failed to fetch category: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Log the response for debugging

        // Check if we have a valid response object
        if (data) {
          // If the data is nested inside a "value" property (common API pattern)
          const categoryData = data.value || data;

          setCategory(categoryData);
          setUpdateName(categoryData.name || "");
          setUpdateDescription(categoryData.description || "");
          console.log("Processed category data:", categoryData);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error(`Error fetching category with id ${id}:`, err);
        setError("Failed to load category. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  // Handle category update
  const handleUpdate = async () => {
    if (!id) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const endpoint = ENDPOINTS.CATEGORIES.UPDATE(Number(id));
      const response = await fetch(buildApiUrl(endpoint), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updateName,
          description: updateDescription,
        }),
      });

      const data = await response.json();

      if (data.isSuccess) {
        setUpdateMessage("Category updated successfully!");

        // Update local state
        if (category) {
          setCategory({
            ...category,
            name: updateName,
            description: updateDescription,
            updatedAt: new Date().toISOString(),
          });
        }

        // Close dialog after short delay
        setTimeout(() => {
          setIsUpdateDialogOpen(false);
          setUpdateMessage(null);
        }, 1500);
      } else {
        setUpdateMessage(`Failed to update: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating category:", err);
      setUpdateMessage("An error occurred while updating. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsDeleting(true);
    setDeleteMessage(null);

    try {
      const endpoint = ENDPOINTS.CATEGORIES.DELETE(Number(id));
      const response = await fetch(buildApiUrl(endpoint), {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.isSuccess) {
        setDeleteMessage("Category deleted successfully!");

        // Navigate back after delay
        setTimeout(() => navigate("/categories"), 1500);
      } else {
        setDeleteMessage(`Failed to delete: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setDeleteMessage("An error occurred while deleting. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Error state
  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full py-10 px-4">
      <Button
        variant="outline"
        onClick={() => navigate("/categories")}
        className="mb-6"
      >
        ← Back to Categories
      </Button>

      {loading ? (
        <div className="h-[300px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : category ? (
        <>
          <CategoryInfo category={category} />

          <div className="w-full max-w-3xl mx-auto mt-4 flex justify-end gap-2">
            <EditDialog
              isOpen={isUpdateDialogOpen}
              setIsOpen={setIsUpdateDialogOpen}
              name={updateName}
              setName={setUpdateName}
              description={updateDescription}
              setDescription={setUpdateDescription}
              onUpdate={handleUpdate}
              isUpdating={isUpdating}
              message={updateMessage}
            />

            <DeleteDialog
              isOpen={isDeleteDialogOpen}
              setIsOpen={setIsDeleteDialogOpen}
              categoryName={category.name}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              message={deleteMessage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p>No category found with ID: {id}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/categories")}
            className="mt-4"
          >
            Back to Categories
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
