import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Package2, Filter, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";

interface Notes {
  content: string;
  note_id: string;
}
interface PackingGroup {
  packing_size: string;
  no_of_bottles: number;
}

interface ShopFloorOrder {
  order_id: string;
  product_name: string;
  brand_name: string;
  customer_name: string;
  batch_number: string;
  status:
    | "Under Production"
    | "Filling"
    | "Labelling"
    | "Packing"
    | "Ready to Dispatch"
    | "Dispatched";
  expected_delivery_date: string;
  manufacturing_date: string;
  expiry_date: string;
  category: "Human" | "Veterinary";
  order_quantity: number;
  packing_groups: PackingGroup[];
  notes: Notes[];
}

const ShopFloorTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [shopFloorOrders, setShopFloorOrders] = useState<ShopFloorOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShopFloorOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]); // ✅ Multiple selection
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); // ✅ Human/Vet filter
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("manufacturing_orders_with_packing")
          .select("*")
          .not("batch_number", "is", null)
          .not("batch_number", "eq", "unassigned");

        if (error) {
          console.error("Error fetching orders:", error.message);
          toast({
            title: "Error",
            description: "Failed to load orders from database",
            variant: "destructive",
          });
          setShopFloorOrders([]);
          return;
        }

        setShopFloorOrders(data ?? []);
      } catch (err) {
        console.error("Unexpected error fetching orders:", err);
        toast({
          title: "Error",
          description: "Something went wrong while loading orders",
          variant: "destructive",
        });
        setShopFloorOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Filtering
  useEffect(() => {
    let filtered = shopFloorOrders;

    // ✅ Apply multiple status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((order) => statusFilter.includes(order.status));
    }

    // ✅ Apply Human/Vet filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((order) => order.category === categoryFilter);
    }

    // ✅ Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [shopFloorOrders, searchTerm, statusFilter, categoryFilter]);

  // Update status in DB
  const updateOrderStatus = async (orderId: string, newStatus: ShopFloorOrder["status"]) => {
    try {
      const { error } = await supabase
        .from("manufacturing_orders")
        .update({ status: newStatus })
        .eq("order_id", orderId);

      if (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "Could not update order status",
          variant: "destructive",
        });
        return;
      }

      setShopFloorOrders((orders) =>
        orders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Could not update order status",
        variant: "destructive",
      });
    }
  };

  // Notes delete
  const handleDeleteNote = async (noteId: string, orderId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("note_id", noteId);
      if (error) throw error;

      setShopFloorOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? { ...o, notes: o.notes.filter((n) => n.note_id !== noteId) }
            : o
        )
      );
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // ✅ Colors for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Production":
        return "bg-yellow-500 text-white";
      case "Filling":
        return "bg-blue-500 text-white";
      case "Labelling":
        return "bg-purple-500 text-white";
      case "Packing":
        return "bg-orange-500 text-white";
      case "Ready to Dispatch":
        return "bg-green-500 text-white";
      case "Dispatched":
        return "bg-teal-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Under Production":
        return 20;
      case "Filling":
        return 40;
      case "Labelling":
        return 60;
      case "Packing":
        return 80;
      case "Ready to Dispatch":
        return 95;
      case "Dispatched":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusCount = (status: string) => {
    return shopFloorOrders.filter((order) => order.status === status).length;
  };

  const totalOrders = shopFloorOrders.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Shop Floor Management</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shop Floor Management</h2>
        <div className="text-sm text-gray-600">Live production tracking and status updates</div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search orders by product, brand, batch, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Multi Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-6 text-gray-500" />
          <Select
            onValueChange={(val) => {
              setStatusFilter((prev) =>
                prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
              );
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status (multi)" />
            </SelectTrigger>
            <SelectContent>
              {["Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch", "Dispatched"].map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {status} ({getStatusCount(status)})
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Human/Vet Filter */}
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Human">Human</SelectItem>
              <SelectItem value="Veterinary">Veterinary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rest of your grid/cards stays the same, but ensure dropdown includes "Dispatched" */}
    </div>
  );
};

export default ShopFloorTab;
