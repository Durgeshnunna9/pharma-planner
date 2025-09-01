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
  status: "All" |"Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch" | "Dispatched";
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

  // Load shop floor orders from DB
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
      case "Under Production": return 20;
      case "Filling": return 40;
      case "Labelling": return 60;
      case "Packing": return 80;
      case "Ready to Dispatch": return 100;
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

      {/* Search and Filter */}
      {/* <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search orders by product, brand, batch, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-6 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status ({totalOrders})</SelectItem>
              <SelectItem value="Under Production">Under Production ({getStatusCount("Under Production")})</SelectItem>
              <SelectItem value="Filling">Filling ({getStatusCount("Filling")})</SelectItem>
              <SelectItem value="Labelling">Labelling ({getStatusCount("Labelling")})</SelectItem>
              <SelectItem value="Packing">Packing ({getStatusCount("Packing")})</SelectItem>
              <SelectItem value="Ready to Dispatch">Ready to Dispatch ({getStatusCount("Ready to Dispatch")})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}
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

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <Card className="text-center p-4 bg-gray-50">
          <div className="text-2xl font-bold text-gray-700 mb-1">{totalOrders}</div>
          <p className="text-xs font-medium text-gray-600">Total Orders</p>
        </Card>
        {["Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch", "Dispatched"].map((status) => {
          const count = getStatusCount(status);
          return (
            <Card 
              key={status} 
              className={`text-center p-4 cursor-pointer transition-all hover:shadow-md ${
                statusFilter.includes(status) ? 'ring-2 ring-blue-400' : ''

              }`}
              onClick={() => {
                if (status === "All") {
                  // Clicking "All" resets everything else
                  setStatusFilter(["All"]);
                } else {
                  if (statusFilter.includes(status)) {
                    // Remove the status
                    const newFilters = statusFilter.filter(s => s !== status);
                    setStatusFilter(newFilters.length > 0 ? newFilters : ["All"]);
                  } else {
                    // Add the status (and remove "All" if present)
                    const newFilters = [...statusFilter.filter(s => s !== "All"), status];
                    setStatusFilter(newFilters);
                  }
                }
              }}
            >
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold ${getStatusColor(status)}`}>
                {count}
              </div>
              <p className="text-xs font-medium text-gray-700">{status}</p>
            </Card>
          );
        })}
      </div>

      {/* Manufacturing Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-2">
                {statusFilter.length > 0 ? `No orders with status "${statusFilter.join(", ")}"` : "Try adjusting your search or filters"}
              </p>
            </Card>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card 
              key={order.order_id} 
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${getStatusBorderColor(order.status)} ${
                selectedOrder === order.order_id ? "ring-2 ring-blue-200" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with Product Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 self-baseline rounded-lg ${order.category === "Human" ? "bg-blue-100" : "bg-green-100"}`}>
                        <Package2 className={`w-5 h-5 ${order.category === "Human" ? "text-blue-600" : "text-green-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-xs pr-2 leading-tight">{order.product_name}</h3>
                        <p className="text-xs text-gray-600">{order.brand_name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {order.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.batch_number}
                    </Badge>
                  </div>

                  {/* Customer and Order Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Building2 className="w-5 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{order.company_name}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600"><span className="font-medium text-gray-700">Order Quantity : </span> {order.order_quantity}L </p>
                    </div>
                    {/*Packing group detials*/}
                    <p>Packing Details:</p>
                    {order.packing_groups.length > 0 ? (
                      <div className="border-2 p-0.5">
                        {order.packing_groups.length > 0 && (
                          <div className="max-h-25  overflow-y-auto space-y-1">
                            {order.packing_groups.map((packing_group) => (
                              <div className="grid grid-cols-2 gap-3 text-xs p-1">
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-500"><span className="font-medium text-gray-700">Packing : </span>{packing_group.packing_size}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-500"><span className="font-medium text-gray-700"> No. of Bottles : </span>{packing_group.no_of_bottles}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ):(
                      <div className="border-2 p-2">
                        <p className="text-xs">No Packing Groups for this order</p>
                      </div>
                    )}
                    
                  </div> 

                  {/* Dates */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600 text-xs"> <span className="text-xs font-semibold text-black">Expected Date :</span> {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600"> <span className="text-xs font-semibold text-black">Manufactured Date :</span> {order.manufacturing_date ? new Date(order.manufacturing_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600"> <span className="text-xs font-semibold text-black">Expiry Date :</span> {order.expiry_date ? new Date(order.expiry_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Order: {order.order_id}</span>
                    </div> */}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-600">{getProgressPercentage(order.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${getProgressPercentage(order.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Update Status</label>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateOrderStatus(order.order_id, value as ShopFloorOrder["status"])}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Under Production">Under Production</SelectItem>
                        <SelectItem value="Filling">Filling</SelectItem>
                        <SelectItem value="Labelling">Labelling</SelectItem>
                        <SelectItem value="Packing">Packing</SelectItem>
                        <SelectItem value="Ready to Dispatch">Ready to Dispatch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Current Status Badge */}
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Shop Floor Notes</span>
                    </div>
                    
                    {order.notes.length > 0 && (
                      <div className="max-h-20 overflow-y-auto space-y-1">
                        {order.notes.map((note) => (
                          <div
                            key={note.note_id}
                            className="flex items-start justify-between bg-gray-50 p-2 rounded text-xs"
                          >
                            <p className="text-gray-600">{note.content}</p>
                            <button
                              onClick={() => handleDeleteNote(note.note_id, order.order_id)}
                              className="ml-2 text-red-500 hover:text-red-700 text-[10px] font-medium"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={selectedOrder === order.order_id ? newNote : ""}
                        onChange={(e) => {
                          setSelectedOrder(order.order_id);
                          setNewNote(e.target.value);
                        }}
                        className="text-s min-h-[60px]"
                      />
                    </div>
                    
                    {selectedOrder === order.order_id && newNote && (
                      <Button
                        size="sm"
                        onClick={() => addNote(order.order_id)}
                        className="w-full h-8 text-s bg-gray-200 text-black hover:bg-gray-400"
                      >
                        Add Note
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopFloorTab;
