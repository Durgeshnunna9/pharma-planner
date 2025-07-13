
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManufacturingOrder {
  id: string;
  productGenericName: string;
  brandName: string;
  customerName: string;
  orderQuantityMl: number;
  packingSize: string;
  numberOfBottles: number;
  expectedDeliveryDate: string;
  batchNumber: string;
  category: "Human" | "Veterinary";
  mfgDate: string;
  expDate: string;
  status: "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch";
}

const ProductionTab = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [newOrder, setNewOrder] = useState({
    productGenericName: "",
    brandName: "",
    customerName: "",
    orderQuantityMl: 0,
    packingSize: "",
    numberOfBottles: 0,
    expectedDeliveryDate: "",
    category: "Human" as "Human" | "Veterinary",
    mfgDate: "",
    expDate: "",
  });

  const generateBatchNumber = (category: "Human" | "Veterinary") => {
    const prefix = category === "Human" ? "SFH25" : "SFV25";
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}${month}${day}${randomNum}`;
  };

  const handleAddOrder = () => {
    if (!newOrder.productGenericName || !newOrder.brandName || !newOrder.customerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const order: ManufacturingOrder = {
      id: Date.now().toString(),
      ...newOrder,
      batchNumber: generateBatchNumber(newOrder.category),
      status: "Under Production",
    };

    setManufacturingOrders([...manufacturingOrders, order]);
    setNewOrder({
      productGenericName: "",
      brandName: "",
      customerName: "",
      orderQuantityMl: 0,
      packingSize: "",
      numberOfBottles: 0,
      expectedDeliveryDate: "",
      category: "Human",
      mfgDate: "",
      expDate: "",
    });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: `Manufacturing order created with batch number: ${order.batchNumber}`,
    });
  };

  const filteredOrders = manufacturingOrders.filter(order =>
    order.productGenericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Production": return "bg-yellow-100 text-yellow-800";
      case "Filling": return "bg-blue-100 text-blue-800";
      case "Labelling": return "bg-purple-100 text-purple-800";
      case "Packing": return "bg-orange-100 text-orange-800";
      case "Ready to Dispatch": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Production Management</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Create Manufacturing Order
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by product name, brand, or batch number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Manufacturing Order Form */}
      {showAddForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Create Manufacturing Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productGenericName">Product Generic Name *</Label>
                <Input
                  id="productGenericName"
                  value={newOrder.productGenericName}
                  onChange={(e) => setNewOrder({...newOrder, productGenericName: e.target.value})}
                  placeholder="Enter generic name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newOrder.category} onValueChange={(value: "Human" | "Veterinary") => setNewOrder({...newOrder, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Human">Human</SelectItem>
                    <SelectItem value="Veterinary">Veterinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  value={newOrder.brandName}
                  onChange={(e) => setNewOrder({...newOrder, brandName: e.target.value})}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="orderQuantityMl">Order Quantity (ml)</Label>
                <Input
                  id="orderQuantityMl"
                  type="number"
                  value={newOrder.orderQuantityMl}
                  onChange={(e) => setNewOrder({...newOrder, orderQuantityMl: Number(e.target.value)})}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="packingSize">Packing Size</Label>
                <Input
                  id="packingSize"
                  value={newOrder.packingSize}
                  onChange={(e) => setNewOrder({...newOrder, packingSize: e.target.value})}
                  placeholder="e.g., 60ml, 100ml"
                />
              </div>
              <div>
                <Label htmlFor="numberOfBottles">Number of Bottles</Label>
                <Input
                  id="numberOfBottles"
                  type="number"
                  value={newOrder.numberOfBottles}
                  onChange={(e) => setNewOrder({...newOrder, numberOfBottles: Number(e.target.value)})}
                  placeholder="Enter number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={newOrder.expectedDeliveryDate}
                  onChange={(e) => setNewOrder({...newOrder, expectedDeliveryDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="mfgDate">Manufacturing Date</Label>
                <Input
                  id="mfgDate"
                  type="date"
                  value={newOrder.mfgDate}
                  onChange={(e) => setNewOrder({...newOrder, mfgDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expDate">Expiry Date</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={newOrder.expDate}
                  onChange={(e) => setNewOrder({...newOrder, expDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddOrder} className="bg-green-500 hover:bg-green-600">
                Create Order
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manufacturing Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No manufacturing orders found. Create your first order to get started.</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{order.productGenericName}</h3>
                    <p className="text-gray-600 mt-1">Brand: {order.brandName} | Customer: {order.customerName}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.category === "Human" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {order.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        Batch: {order.batchNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Quantity: {order.orderQuantityMl}ml</p>
                    <p>Bottles: {order.numberOfBottles}</p>
                    <p>Delivery: {order.expectedDeliveryDate}</p>
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

export default ProductionTab;
