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
import { useCustomers } from "@/hooks/customers";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Customers() {
  const { customers, loading, error, getUserStatusLabel } = useCustomers();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if the date is valid before formatting
      if (isNaN(date.getTime())) return "";
      return format(date, "PPP");
    } catch {
      return "";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "1":
      case "Actived":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "2":
      case "Inactived":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "3":
      case "Deleted":
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
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {loading ? (
        <div className="h-[200px] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableCaption>A list of all registered customers.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.fullName}
                    </TableCell>
                    <TableCell>{customer.phoneNumber}</TableCell>
                    <TableCell>
                      {customer.address?.length > 30
                        ? `${customer.address.substring(0, 30)}...`
                        : customer.address || ""}
                    </TableCell>
                    <TableCell>{formatDate(customer.dateOfBirth)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {getUserStatusLabel(customer.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-0 h-8 w-8"
                      >
                        <Link to={`/customers/${customer.id}`}>
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
}
