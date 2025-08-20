import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Package2, Filter, Calendar, User, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";

interface ShopFloorOrder {
  id: string;
  order_id: string;
  genericName: string;
  brandName: string;
  customerName: string;
  batchNumber: string;
  qtyLiters: number;
  qtyPackingSize: string;
  primaryUnits: number;
  status: "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch";
  notes: string[];
  expectedDeliveryDate: string;
  manufacturingDate: string;
  expiryDate: string;
  category: "Human" | "Veterinary";
  orderQuantity: number;
}

const ShopFloorTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [shopFloorOrders, setShopFloorOrders] = useState<ShopFloorOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShopFloorOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load shop floor orders from DB
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // First, try to use the view if it exists
        let { data: viewData, error: viewError } = await supabase
          .from("manufacturing_orders_with_packing")
          .select("*")
          .not("batch_number", "is", null)
          .not("batch_number", "eq", "unassigned");

        if (viewError) {
          console.log("View not available, trying direct table queries:", viewError.message);
          
          // Fallback: Query individual tables and join manually
          const { data: ordersData, error: ordersError } = await supabase
            .from("manufacturing_orders")
            .select(`
              order_id,
              generic_name,
              brand_name,
              customer_name,
              batch_number,
              qty_liters,
              qty_packing_size,
              primary_units,
              status,
              expected_delivery_date,
              manufacturing_date,
              expiry_date,
              category,
              order_quantity
            `)
            .not("batch_number", "is", null)
            .not("batch_number", "eq", "unassigned");

          if (ordersError) {
            console.error("Error fetching orders:", ordersError);
            toast({
              title: "Error",
              description: "Failed to load orders from database",
              variant: "destructive"
            });
            return;
          }

          if (ordersData && ordersData.length > 0) {
            // Fetch notes for each order
            const ordersWithNotes = await Promise.all(
              ordersData.map(async (order) => {
                const { data: notesData, error: notesError } = await supabase
                  .from("notes")
                  .select("note_text, created_at")
                  .eq("manufacturing_order_id", order.order_id);

                let notes: string[] = [];
                if (!notesError && notesData) {
                  notes = notesData.map(note => 
                    `${new Date(note.created_at).toLocaleString()}: ${note.note_text}`
                  );
                }

                return {
                  id: order.order_id,
                  order_id: order.order_id,
                  genericName: order.generic_name || "",
                  brandName: order.brand_name || "",
                  customerName: order.customer_name || "",
                  batchNumber: order.batch_number || "",
                  qtyLiters: order.qty_liters || 0,
                  qtyPackingSize: order.qty_packing_size || "",
                  primaryUnits: order.primary_units || 0,
                  status: order.status || "Under Production",
                  notes: notes,
                  expectedDeliveryDate: order.expected_delivery_date || "",
                  manufacturingDate: order.manufacturing_date || "",
                  expiryDate: order.expiry_date || "",
                  category: order.category || "Human",
                  orderQuantity: order.order_quantity || 0
                };
              })
            );

            setShopFloorOrders(ordersWithNotes);
          } else {
            setShopFloorOrders([]);
          }
        } else if (viewData && viewData.length > 0) {
          // Use the view data directly
          const transformedOrders = viewData.map((order: any) => ({
            id: order.order_id || order.id,
            order_id: order.order_id || order.id,
            genericName: order.generic_name || order.genericName || "",
            brandName: order.brand_name || order.brandName || "",
            customerName: order.customer_name || order.customerName || "",
            batchNumber: order.batch_number || order.batchNumber || "",
            qtyLiters: order.qty_liters || order.qtyLiters || 0,
            qtyPackingSize: order.qty_packing_size || order.qtyPackingSize || "",
            primaryUnits: order.primary_units || order.primaryUnits || 0,
            status: order.status || "Under Production",
            notes: order.notes || [],
            expectedDeliveryDate: order.expected_delivery_date || order.expectedDeliveryDate || "",
            manufacturingDate: order.manufacturing_date || order.manufacturingDate || "",
            expiryDate: order.expiry_date || order.expiryDate || "",
            category: order.category || "Human",
            orderQuantity: order.order_quantity || order.orderQuantity || 0
          }));
          setShopFloorOrders(transformedOrders);
        } else {
          setShopFloorOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders from database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Filter orders based on search term and status filter
  useEffect(() => {
    let filtered = shopFloorOrders;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [shopFloorOrders, searchTerm, statusFilter]);

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

      // Insert new note into notes table
      const { error: insertError } = await supabase
        .from("notes")
        .insert({
          manufacturing_order_id: orderId,
          note_text: newNote,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error adding note:", insertError);
        toast({ 
          title: "Error", 
          description: "Could not add note", 
          variant: "destructive" 
        });
        return;
      }

      // Update local state
      const updatedNotes = [...order.notes, `${new Date().toLocaleString()}: ${newNote}`];
      setShopFloorOrders((orders) =>
        orders.map((o) =>
          o.order_id === orderId ? { ...o, notes: updatedNotes } : o
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shop Floor Management</h2>
        <div className="text-sm text-gray-600">
          Live production tracking and status updates
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
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
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses ({totalOrders})</SelectItem>
              <SelectItem value="Under Production">Under Production ({getStatusCount("Under Production")})</SelectItem>
              <SelectItem value="Filling">Filling ({getStatusCount("Filling")})</SelectItem>
              <SelectItem value="Labelling">Labelling ({getStatusCount("Labelling")})</SelectItem>
              <SelectItem value="Packing">Packing ({getStatusCount("Packing")})</SelectItem>
              <SelectItem value="Ready to Dispatch">Ready to Dispatch ({getStatusCount("Ready to Dispatch")})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="text-center p-4 bg-gray-50">
          <div className="text-2xl font-bold text-gray-700 mb-1">{totalOrders}</div>
          <p className="text-xs font-medium text-gray-600">Total Orders</p>
        </Card>
        {["Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch"].map((status) => {
          const count = getStatusCount(status);
          return (
            <Card 
              key={status} 
              className={`text-center p-4 cursor-pointer transition-all hover:shadow-md ${
                statusFilter === status ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setStatusFilter(statusFilter === status ? "All" : status)}
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
                {statusFilter !== "All" ? `No orders with status "${statusFilter}"` : "Try adjusting your search or filters"}
              </p>
            </Card>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card 
              key={order.id} 
              className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${getStatusBorderColor(order.status)} ${
                selectedOrder === order.order_id ? "ring-2 ring-blue-200" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with Product Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${order.category === "Human" ? "bg-blue-100" : "bg-green-100"}`}>
                        <Package2 className={`w-5 h-5 ${order.category === "Human" ? "text-blue-600" : "text-green-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{order.genericName}</h3>
                        <p className="text-xs text-gray-600">{order.brandName}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {order.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.batchNumber}
                    </Badge>
                  </div>

                  {/* Customer and Order Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-700">{order.customerName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-medium text-gray-700">Quantity</p>
                        <p className="text-gray-600">{order.qtyLiters}L ({order.primaryUnits} units)</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-medium text-gray-700">Packing</p>
                        <p className="text-gray-600">{order.qtyPackingSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Expected: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Order: {order.order_id}</span>
                    </div>
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
                        {order.notes.map((note, index) => (
                          <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {note}
                          </p>
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
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                    
                    {selectedOrder === order.order_id && newNote && (
                      <Button
                        size="sm"
                        onClick={() => addNote(order.order_id)}
                        className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600"
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
