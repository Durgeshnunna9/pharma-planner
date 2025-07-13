
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShopFloorOrder {
  id: string;
  genericName: string;
  brandName: string;
  customerName: string;
  batchNumber: string;
  qtyLiters: number;
  qtyPackingSize: string;
  primaryUnits: number;
  status: "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch";
  notes: string[];
}

const ShopFloorTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

  // Sample data - in a real app, this would come from the production orders
  const [shopFloorOrders, setShopFloorOrders] = useState<ShopFloorOrder[]>([
    {
      id: "1",
      genericName: "Paracetamol Syrup",
      brandName: "ParaCure",
      customerName: "MediPharm Ltd",
      batchNumber: "SFH25120501",
      qtyLiters: 50,
      qtyPackingSize: "100ml x 500 bottles",
      primaryUnits: 500,
      status: "Under Production",
      notes: [],
    },
    {
      id: "2",
      genericName: "Amoxicillin Suspension",
      brandName: "AmoxiVet",
      customerName: "VetCare Solutions",
      batchNumber: "SFV25120502",
      qtyLiters: 30,
      qtyPackingSize: "60ml x 500 bottles",
      primaryUnits: 500,
      status: "Filling",
      notes: ["Started filling process at 10:00 AM"],
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: ShopFloorOrder["status"]) => {
    setShopFloorOrders(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    toast({
      title: "Status Updated",
      description: `Order status changed to ${newStatus}`,
    });
  };

  const addNote = (orderId: string) => {
    if (!newNote.trim()) return;

    setShopFloorOrders(orders =>
      orders.map(order =>
        order.id === orderId 
          ? { ...order, notes: [...order.notes, `${new Date().toLocaleString()}: ${newNote}`] }
          : order
      )
    );
    
    setNewNote("");
    toast({
      title: "Note Added",
      description: "Shop floor note has been logged",
    });
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

  const filteredOrders = shopFloorOrders.filter(order =>
    order.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shop Floor Management</h2>
        <div className="text-sm text-gray-600">
          Live production tracking and status updates
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search orders by product, brand, or batch number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Manufacturing Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <p className="text-gray-500">No manufacturing orders found on the shop floor.</p>
            </Card>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className={`hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
              selectedOrder === order.id ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"
            }`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Package2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{order.genericName}</h3>
                        <p className="text-xs text-gray-600">{order.brandName}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.batchNumber}
                    </Badge>
                  </div>

                  {/* Customer and Quantities */}
                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-gray-700">Customer: {order.customerName}</p>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <p>Qty: {order.qtyLiters}L</p>
                      <p>Units: {order.primaryUnits}</p>
                    </div>
                    <p className="text-gray-600">{order.qtyPackingSize}</p>
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
                    <label className="text-xs font-medium text-gray-700">Status</label>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateOrderStatus(order.id, value as ShopFloorOrder["status"])}
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

                  {/* Status Badge */}
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
                        value={selectedOrder === order.id ? newNote : ""}
                        onChange={(e) => {
                          setSelectedOrder(order.id);
                          setNewNote(e.target.value);
                        }}
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                    
                    {selectedOrder === order.id && newNote && (
                      <Button
                        size="sm"
                        onClick={() => addNote(order.id)}
                        className="w-full h-8 text-xs bg-green-500 hover:bg-green-600"
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        {["Under Production", "Filling", "Labelling", "Packing", "Ready to Dispatch"].map((status) => {
          const count = shopFloorOrders.filter(order => order.status === status).length;
          return (
            <Card key={status} className="text-center p-4">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold ${getStatusColor(status)}`}>
                {count}
              </div>
              <p className="text-xs font-medium text-gray-700">{status}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ShopFloorTab;
