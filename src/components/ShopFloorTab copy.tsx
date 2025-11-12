// ShopFloorTab.tsx (full component with stock-edit modal integrated)
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
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "@radix-ui/react-switch";

interface Notes {
  content: string;
  note_id: string;
}
interface PackingGroup {
  id: string;
  packing_size: string;
  no_of_bottles: number;
}

interface ShopFloorOrder {
  order_id: string;
  product_name: string;
  product_description: string;
  brand_name: string;
  company_name: string;
  batch_number: string;
  status: "InQueue" | "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch" | "Dispatched";
  expected_delivery_date: string;
  manufacturing_date: string;
  expiry_date: string;
  category: "Human" | "Veterinary";
  order_quantity: number;
  packing_groups: PackingGroup[];
  notes: Notes[];
  bottles_present: boolean;
  labels_present: boolean;
}

const ShopFloorTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null); // used for notes textarea selection
  const [newNote, setNewNote] = useState("");
  const [shopFloorOrders, setShopFloorOrders] = useState<ShopFloorOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShopFloorOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(["All"]); // ✅ Multiple selection
  const [categoryFilter, setCategoryFilter] = useState<string>("All"); // ✅ Human/Vet filter
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [priorityOrderIds, setPriorityOrderIds] = useState<Set<string>>(new Set());
  const [priorityFirst, setPriorityFirst] = useState<boolean>(true || false);

  // Modal & edit state for bottles/labels
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOrderId, setModalOrderId] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<ShopFloorOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bottles_present: false,
    labels_present: false,
  });

  const STATUS_FLOW: ShopFloorOrder["status"][] = [
    "InQueue",
    "Under Production",
    "Filling",
    "Labelling",
    "Packing",
    "Ready to Dispatch",
    "Dispatched",
  ];

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

        // Ensure shape safety: some rows may not have packing_groups/notes arrays - normalise
        const normalised = (data ?? []).map((r: any) => ({
          ...r,
          packing_groups: r.packing_groups ?? [],
          notes: r.notes ?? [],
          bottles_present: typeof r.bottles_present === "boolean" ? r.bottles_present : false,
          labels_present: typeof r.labels_present === "boolean" ? r.labels_present : false,
        }));

        setShopFloorOrders(normalised);
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

  // Overdue alert when screen loads or data updates
  useEffect(() => {
    if (isLoading) return;
    if (!shopFloorOrders || shopFloorOrders.length === 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueCount = shopFloorOrders.reduce((acc, order) => {
      if (!order.expected_delivery_date) return acc;
      const d = new Date(order.expected_delivery_date);
      d.setHours(0, 0, 0, 0);
      return acc + (d < today && order.status !== "Dispatched" ? 1 : 0);
    }, 0);
    if (overdueCount > 0) {
      toast({
        title: "Delivery due",
        description: `${overdueCount} order(s) are past expected delivery date and not dispatched`,
        variant: "destructive",
      });
    }
  }, [isLoading, shopFloorOrders, toast]);

  useEffect(() => {
    let filtered = shopFloorOrders;

    // ✅ Filter logic
    if (statusFilter.length === 1 && statusFilter.includes("Dispatched")) {
      // Show only dispatched
      filtered = filtered.filter(order => order.status === "Dispatched");
    } else if (!(statusFilter.length === 1 && statusFilter.includes("All"))) {
      // Show only selected statuses (excluding dispatched unless selected)
      filtered = filtered.filter(order =>
        statusFilter.includes(order.status) && order.status !== "Dispatched"
      );
    } else {
      // Default: show all except dispatched
      filtered = filtered.filter(order => order.status !== "Dispatched");
    }

    // ✅ Apply Human/Vet category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(order => order.category === categoryFilter);
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

    // ✅ Sort by priority first, then delivery date
    const sorted = [...filtered].sort((a, b) => {
      if (priorityFirst) {
        const ap = priorityOrderIds.has(a.order_id) ? 1 : 0;
        const bp = priorityOrderIds.has(b.order_id) ? 1 : 0;
        if (ap !== bp) return bp - ap;
      }
      const ad = a.expected_delivery_date ? new Date(a.expected_delivery_date).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.expected_delivery_date ? new Date(b.expected_delivery_date).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });

    setFilteredOrders(sorted);
  }, [shopFloorOrders, searchTerm, statusFilter, categoryFilter, priorityFirst, priorityOrderIds]);

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
      const { data: insertedNote, error: insertError } = await supabase
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
      case "InQueue":
        return "bg-pink-500 text-white"; // Deep red (critical, starting point)
      case "Under Production":
        return "bg-orange-500 text-white"; // Orange (work in progress)
      case "Filling":
        return "bg-yellow-500 text-white"; // Warm yellow-orange
      case "Labelling":
        return "bg-sky-400 text-white"; // Bright yellow
      case "Packing":
        return "bg-indigo-400 text-white"; // Sky blue
      case "Ready to Dispatch":
        return "bg-teal-500 text-white"; // Indigo (almost done)
      case "Dispatched":
        return "bg-green-700 text-white"; // Success green (final stage)
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "InQueue": return "border-pink-600"
      case "Under Production": return "border-orange-500";
      case "Filling": return "border-yellow-500";
      case "Labelling": return "border-sky-400";
      case "Packing": return "border-indigo-400";
      case "Ready to Dispatch": return "border-teal-500";
      case "Dispatched": return "border-green-700";
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

  const STATUS_COLORS: Record<string, string> = { Unassigned: "bg-red-400 hover:bg-red-500", InQueue: "bg-pink-500 hover:bg-pink-600", "Under Production": "bg-orange-500 hover:bg-orange-600", Filling: "bg-yellow-500 hover:bg-yellow-600", Labelling: "bg-sky-500 hover:bg-sky-600", Packing: "bg-indigo-500 hover:bg-indigo-600", "Ready to Dispatch": "bg-teal-500 hover:bg-teal-600", Dispatched: "bg-green-500 hover:bg-green-600", };

  const getStatusCount = (status: string) => {
    return shopFloorOrders.filter(order => order.status === status).length;
  };

  const totalOrders = shopFloorOrders.length;

  // Handle delete note
  const handleDeleteNote = async (noteId: string, orderId: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("note_id", noteId);

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

  const calculateIsOverdue = (order: { expected_delivery_date: string | null; status: string }) => {
    return order.expected_delivery_date
      ? new Date(order.expected_delivery_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
        && order.status !== "Dispatched"
      : false;
  };

  // -----------------------
  // Modal / stock editing
  // -----------------------

  const handleCardClickOpenModal = (e: React.MouseEvent, order: ShopFloorOrder) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("textarea") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("svg")
    ) {
      return;
    }
  
    setModalOrder(order);
    setModalOrderId(order.order_id);
    setEditForm({
      bottles_present: !!order.bottles_present,
      labels_present: !!order.labels_present,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };
  
  // Save changes
  const handleSaveStockChanges = async () => {
    if (!modalOrderId) return;
  
    try {
      const { error } = await supabase
        .from("manufacturing_orders")
        .update({
          bottles_present: editForm.bottles_present,
          labels_present: editForm.labels_present,
        })
        .eq("order_id", modalOrderId);
  
      if (error) {
        console.error("Error updating bottles/labels:", error);
        toast({
          title: "Error",
          description: "Could not update stock fields in DB",
          variant: "destructive",
        });
        return;
      }
  
      // Update local state list
      setShopFloorOrders((prev) =>
        prev.map((o) =>
          o.order_id === modalOrderId
            ? {
                ...o,
                bottles_present: editForm.bottles_present,
                labels_present: editForm.labels_present,
              }
            : o
        )
      );
  
      // Update modal cache
      setModalOrder((prev) =>
        prev
          ? {
              ...prev,
              bottles_present: editForm.bottles_present,
              labels_present: editForm.labels_present,
            }
          : prev
      );
  
      toast({
        title: "Saved",
        description: "Bottles and labels updated successfully",
      });
  
      setIsEditing(false);
      setIsModalOpen(false);
      setModalOrderId(null);
      setModalOrder(null);
    } catch (err) {
      console.error("Unexpected error saving stock:", err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  // Cancel modal and reset
  const handleCancelModal = () => {
    if (modalOrder) {
      setEditForm({
        bottles_present: !!modalOrder.bottles_present,
        labels_present: !!modalOrder.labels_present,
      });
    } else {
      setEditForm({
        bottles_present: false,
        labels_present: false,
      });
    }
    setIsEditing(false);
    setIsModalOpen(false);
    setModalOrderId(null);
    setModalOrder(null);
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
              {["InQueue", "Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch", "Dispatched"].map(
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

        {/* Priority-first toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={priorityFirst ? "default" : "outline"}
            className={priorityFirst ? "bg-pink-600 text-white hover:bg-pink-700" : ""}
            onClick={() => setPriorityFirst(v => !v)}
          >
            {priorityFirst ? "Priority first: ON" : "Priority first: OFF"}
          </Button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
        <Card className="text-center p-4 bg-gray-50">
          <div className="text-2xl font-bold text-gray-700 mb-1">{totalOrders}</div>
          <p className="text-xs font-medium text-gray-600">Total Orders</p>
        </Card>
        {["InQueue", "Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch", "Dispatched"].map((status) => {
          const count = getStatusCount(status);
          return (
            <Card
              key={status}
              className={`text-center p-4 cursor-pointer transition-all hover:shadow-md ${
                statusFilter.includes(status) ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => {
                if (status === "All") {
                  setStatusFilter(["All"]);
                } else {
                  if (statusFilter.includes(status)) {
                    const newFilters = statusFilter.filter(s => s !== status);
                    setStatusFilter(newFilters.length > 0 ? newFilters : ["All"]);
                  } else {
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
              className={`relative hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${getStatusBorderColor(order.status)} ${
                selectedOrder === order.order_id ? "ring-2 ring-blue-200" : ""
              }`}
              onClick={(e) => handleCardClickOpenModal(e, order)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Priority Star */}
                  <button
                    aria-label="Toggle priority"
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPriorityOrderIds(prev => {
                        const next = new Set(prev);
                        if (next.has(order.order_id)) next.delete(order.order_id); else next.add(order.order_id);
                        return next;
                      });
                    }}
                    title={priorityOrderIds.has(order.order_id) ? "Unset priority" : "Set as priority"}
                  >
                    <Star
                      className={`${priorityOrderIds.has(order.order_id) ? "text-yellow-500" : "text-gray-300"}`}
                      fill={priorityOrderIds.has(order.order_id) ? "#eab308" : "none"}
                      size={18}
                    />
                  </button>
                  {/* Header with Product Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 self-baseline rounded-lg ${order.category === "Human" ? "bg-blue-100" : "bg-green-100"}`}>
                        <Package2 className={`w-5 h-5 ${order.category === "Human" ? "text-blue-600" : "text-green-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 text-xs pr-2 leading-tight"><span className="font-bold">{order.product_name}</span> </h3>
                        <p className="text-xs text-gray-800 pt-1 pb-1"><span className="font-bold">Description:</span> {order.product_description}</p>
                        <p className="text-xs text-gray-700"><span className="font-bold">Brand Name:</span> {order.brand_name}</p>

                        <Badge variant="outline" className="text-xs mt-1">
                          {order.category}
                        </Badge>
                      </div>
                    </div>
                    <div >
                      <Badge variant="outline" className={`"text-xs" ${order.category === "Human" ? "bg-blue-100" : "bg-green-100"}`}>
                        {order.batch_number}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer and Order Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs pb-3">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <span className="text-md text-bold text-gray-700 ">{order.company_name}</span>
                    </div>
                    <div className="border-2 border-gray-500 bg-white p-3 rounded-lg relative">
                      <div className="absolute -top-2.5 left-3 bg-white px-2 text-gray-600 text-xs font-bold uppercase">
                        Order Info
                      </div>
                      <div className="flex items-center gap-3 pb-2">

                        <div className="flex-1">
                          <p className="text-gray-800 text-sm">
                            <span className="font-bold text-green-700 pb-2 pl-2">Order Quantity: {order.order_quantity}L</span>
                          </p>
                        </div>
                      </div>
                      <div className="p-2  border-2 rounded-md mb-3 mt-1">

                        {/*Packing group detials*/}
                        <p className="text-md pb-2 font-bold">Packing Details:</p>
                        {order.packing_groups.length > 0 ? (
                          <div className="space-y-2">
                            {order.packing_groups.map((packing_group) => (
                              <div
                                key={packing_group.id}
                                className=" p-1 rounded-lg border-2  border-green-200 flex items-center gap-3"
                              >

                                <div className="flex-1">
                                  <div className="text-gray-900 text-sm mb-1">
                                    Packing Size: <span className="font-semibold">{packing_group.packing_size}</span>
                                  </div>
                                  <div className="text-gray-800 text-sm">
                                    Quantity: <span className="font-semibold">{packing_group.no_of_bottles} bottles</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 text-center">No Packing Groups for this order</p>
                          </div>
                        )}
                      </div>

                      {/*Item Availability */}
                      <div className="space-y-2 pb-2 ">
                        <p className="font-semibold text-sm"><span className="font-bold text-gray-900">Bottles: </span> {order.bottles_present ? "In Stock ✅" : "Out of Stock ❌"}</p>
                        <p className="font-semibold text-sm"><span className="font-bold text-gray-900">Labels: </span> {order.labels_present ? "In Stock ✅" : "Out of Stock ❌"}</p>
                      </div>
                      {/* Dates */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className={`text-gray-600 text-sm font-semibold ${calculateIsOverdue(order) ? "text-red-600 text-lg font-bold" : "text-gray-900 text-sm"}`}> <span className="font-bold text-gray-900">Expected Delivery Date :</span> {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600"> <span className="text-sm font-bold text-black">Manufactured Date :</span> {order.manufacturing_date ? new Date(order.manufacturing_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600"> <span className="text-sm font-bold text-black">Expiry Date :</span> {order.expiry_date ? new Date(order.expiry_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Current Status Badge */}
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  {/* Progress and Controls */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-600">{getProgressPercentage(order.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-red-300 transition-all duration-300"
                        style={{ width: `${getProgressPercentage(order.status)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {(() => {
                      const idx = STATUS_FLOW.indexOf(order.status);
                      const prevStatus = idx > 0 ? STATUS_FLOW[idx - 1] : null;
                      const nextStatus = idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
                      return (
                        <div className="flex justify-between w-full mr-4 ml-4">
                          {prevStatus ? (
                            <Button
                              disabled={!prevStatus}
                              onClick={() => updateOrderStatus(order.order_id, prevStatus)}
                              className={`h-6 px-2 text-[11px] leading-none bg-slate-600 mr-2 ${STATUS_COLORS[prevStatus]}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              {`Move back to ${prevStatus}`}

                            </Button>
                          ) : (<div></div>)}
                          {nextStatus ? (
                            <Button
                              disabled={!nextStatus}
                              onClick={() => updateOrderStatus(order.order_id, nextStatus)}
                              className={`h-6 px-2 text-[11px] leading-none bg-slate-600 ml-2 ${STATUS_COLORS[nextStatus]}`}
                            >
                              {nextStatus ? `Move to ${nextStatus}` : ""}
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          ) : (<div></div>)}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Shop Floor Notes</span>
                    </div>

                    {order.notes.length > 0 && (
                      <div className="max-h-20 overflow-y-auto space-y-2">
                        {order.notes.map((note) => (
                          <div
                            key={note.note_id}
                            className="bg-blue-50 p-3 rounded-md border border-blue-200 flex gap-3"
                          >
                            <span className="text-blue-600 text-lg flex-shrink-0">ℹ️</span>
                            <div className="flex-1 flex items-start justify-between">
                              <p className="text-gray-800 text-xs leading-relaxed">{note.content}</p>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); handleDeleteNote(note.note_id, order.order_id); }}
                                className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium flex-shrink-0"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note..."
                        value={selectedOrder === order.order_id ? newNote : ""}
                        onChange={(e) => {
                          // Prevent opening modal when typing - we already check in handleCardClickOpenModal
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

                {/* ---------------------------
                    Stock Edit Modal is placed outside map below (not repeated per card)
                    --------------------------- */}
              </CardContent>
            </Card>

          ))
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelModal();
          else setIsModalOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full">
              <span>Edit Stock Status</span>
            </DialogTitle>
          </DialogHeader>

          {/* Order Info */}
          {modalOrder && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{modalOrder.product_name}</div>
                  <div className="text-xs text-gray-600">
                    {modalOrder.company_name} • Batch: {modalOrder.batch_number}
                  </div>
                </div>
                <div className="flex flex-col justify-right">
                  <Badge variant="outline" className="text-xs mb-2">
                    {modalOrder.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {modalOrder.batch_number}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Bottles */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-1">Bottles :</label>
            {isEditing ? (
              <button
                type="button"
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    bottles_present: !editForm.bottles_present,
                  })
                }
                className={`w-12 h-6 flex items-center rounded-full transition-colors ${
                  editForm.bottles_present ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    editForm.bottles_present ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </button>
            ) : (
              <span className="text-sm text-gray-700 ml-2">
                {modalOrder?.bottles_present ? "In Stock ✅" : "Out of Stock ❌"}
              </span>
            )}
          </div>

          {/* Labels */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-1">Labels :</label>
            {isEditing ? (
              <button
                type="button"
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    labels_present: !editForm.labels_present,
                  })
                }
                className={`w-12 h-6 flex items-center rounded-full transition-colors ${
                  editForm.labels_present ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    editForm.labels_present ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </button>
            ) : (
              <span className="text-sm text-gray-700 ml-2">
                {modalOrder?.labels_present ? "In Stock ✅" : "Out of Stock ❌"}
              </span>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="mt-6 flex justify-between items-center">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancelModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStockChanges}>Save</Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopFloorTab;
