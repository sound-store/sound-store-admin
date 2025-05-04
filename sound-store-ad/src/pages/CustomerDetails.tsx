import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { useCustomers, Customer } from "@/hooks/customers";
import { Button } from "@/components/ui/button";
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
import { ENDPOINTS, buildApiUrl } from "@/apis";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, getUserStatusLabel } = useCustomers();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const customerData = await getCustomer(id);

        if (customerData) {
          setCustomer(customerData);
          setCurrentStatus(customerData.status);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Failed to load customer details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, getCustomer]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return format(date, "PPP");
    } catch {
      return "";
    }
  };

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
  };

  const handleUpdateStatus = async () => {
    if (!id || !customer) return;

    try {
      setUpdating(true);
      setUpdateSuccess(false);

      const endpoint = ENDPOINTS.USERS.UPDATE_CUSTOMER_STATUS(id);
      const url = new URL(buildApiUrl(endpoint));
      url.searchParams.append("status", currentStatus);

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.isSuccess) {
        setUpdateSuccess(true);
        // Update the local customer state with the new status
        setCustomer((prev) =>
          prev ? { ...prev, status: currentStatus } : null
        );
      } else {
        setError(`Failed to update status: ${data.message}`);
      }
    } catch (err) {
      setError("Failed to update customer status");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-4">
        <Button variant="outline" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-10 px-4">
        <Button variant="outline" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <Button variant="outline" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
      </Button>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Customer Details</CardTitle>
            <CardDescription>
              View and manage customer information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  First Name
                </h3>
                <p className="mt-1 text-base">{customer.firstName || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Name
                </h3>
                <p className="mt-1 text-base">{customer.lastName || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </h3>
                <p className="mt-1 text-base">{customer.email || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </h3>
                <p className="mt-1 text-base">{customer.phoneNumber || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </h3>
                <p className="mt-1 text-base">{customer.address || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date of Birth
                </h3>
                <p className="mt-1 text-base">
                  {formatDate(customer.dateOfBirth) || "—"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Status
                </h3>
                <p className="mt-1 text-base">
                  {getUserStatusLabel(customer.status)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-3">Update Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    New Status
                  </label>
                  <Select
                    value={currentStatus}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="2">Inactive</SelectItem>
                      <SelectItem value="3">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || customer.status === currentStatus}
                  className="h-10"
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
              {updateSuccess && (
                <p className="mt-2 text-sm text-green-600">
                  Status updated successfully!
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <p className="text-xs text-gray-500">Customer ID: {customer.id}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetails;
