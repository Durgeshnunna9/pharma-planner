import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Package2, Filter, Calendar, User, Hash, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";

interface Notes{
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
  company_name: string;
  batch_number: string;
  status: "All" |"InQueue" | "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch" | "Dispatched";
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
  const [statusFilter, setStatusFilter] = useState<string[]>(["All"]); // ✅ Multiple selection
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); // ✅ Human/Vet filter
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const STATUS_FLOW = ["Unassigned", "InQueue", "InProgress", "Completed", "Closed"] as const;

  // Load shop floor orders from DB
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("manufacturing_orders_with_packing")
          .select("*")
          .not("batch_number", "is", null)
          .not("batch_number", "eq", "inqueue");
  
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

   
  // Filter orders based on search term and status filter
  useEffect(() => {
    let filtered = shopFloorOrders;
  
    // ✅ Apply multiple status filter (with "All" special handling)
    if (!(statusFilter.length === 1 && statusFilter.includes("All"))) {
      filtered = filtered.filter((order) => statusFilter.includes(order.status));
    }
  
    // ✅ Apply Human/Vet filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((order) => order.category === categoryFilter);
    }
  
   
    // ✅ Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.product_name?.toLowerCase().includes(lowerSearch) ||
        order.brand_name?.toLowerCase().includes(lowerSearch) ||
        order.batch_number?.toLowerCase().includes(lowerSearch) ||
        order.company_name?.toLowerCase().includes(lowerSearch)
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
          variant: "destructive" 
        });
        return;
      }

      // Update local state
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
        variant: "destructive" 
      });
    }
  };

  // Add note in DB
  const addNote = async (orderId: string) => {
    if (!newNote.trim()) return;

    try {
      const order = shopFloorOrders.find((o) => o.order_id === orderId);
      if (!order) return;

      // Insert new note into notes table and return it
      const { data:insertedNote, error: insertError } = await supabase
        .from("notes")
        .insert({
          manufacturing_order_id: orderId,
          content: newNote,
        })
        .select("note_id, content")
        .single();

      if (insertError) {
        console.error("Error adding note:", insertError);
        toast({ 
          title: "Error", 
          description: "Could not add note", 
          variant: "destructive" 
        });
        return;
      }

      // Update local state with structured note object
      setShopFloorOrders((orders) =>
        orders.map((o) =>
          o.order_id === orderId
            ? { ...o, notes: [...(o.notes || []), insertedNote] }
            : o
        )
      );

      setNewNote("");
      toast({ 
        title: "Note Added", 
        description: "Shop floor note has been logged" 
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ 
        title: "Error", 
        description: "Could not add note", 
        variant: "destructive" 
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "InQueue": return "bg-red-500 text-white"
      case "Under Production": return "bg-yellow-500 text-white";
      case "Filling": return "bg-blue-500 text-white";
      case "Labelling": return "bg-purple-500 text-white";
      case "Packing": return "bg-orange-500 text-white";
      case "Ready to Dispatch": return "bg-green-500 text-white";
      case "Dispatched": return "bg-teal-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "InQueue": return "border-red-400"
      case "Under Production": return "border-yellow-400";
      case "Filling": return "border-blue-400";
      case "Labelling": return "border-purple-400";
      case "Packing": return "border-orange-400";
      case "Ready to Dispatch": return "border-green-400";
      case "Dispatched": return "border-teal-400";
      default: return "border-gray-400";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "InQueue": return 10;
      case "Under Production": return 20;
      case "Filling": return 40;
      case "Labelling": return 60;
      case "Packing": return 80;
      case "Ready to Dispatch": return 90;
      case "Dispatched": return 100;
      default: return 0;
    }
  };

  const getStatusCount = (status: string) => {
    return shopFloorOrders.filter(order => order.status === status).length;
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

  const handleDeleteNote = async (noteId: string, orderId: string) => {
    try {
      // delete from Supabase (or API)
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("note_id", noteId);
  
      if (error) throw error;
  
      // update UI state (remove note from local order object)
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shop Floor Management</h2>
        <div className="text-sm text-gray-600">
          Live production tracking and status updates
        </div>
      </div>
      {/* ... existing code ... */}
    </div>
  );
};

export default ShopFloorTab;


