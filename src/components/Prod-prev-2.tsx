import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogFooter } from "@/components/ui/dialog";
import { Trash2} from "lucide-react"


interface PackingGroup {
  manufacturing_order_id: number;
  packingSize: string;
  numberOfBottles: number;
}

interface ManufacturingOrder {
  productId: string;
  customerId: string;
  orderId: string;
  productName: string;
  brandName: string;
  customerName: string;
  orderQuantityL: number;
  packingGroups: PackingGroup[]; // multiple groups now
  expectedDeliveryDate: string;
  batchNumber: string | null; // null if unassigned
  category: "Human" | "Veterinary";
  mfgDate: string;
  expDate: string;
  status: "Unassigned" | "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch";
}
const ProductionTab = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"All" | "Human" | "Veterinary">("All");
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const { toast } = useToast();
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_code: '',
    customer_name: '',
    gstin_number: '',
    company_name: '',
    dl20b_number: '',
    dl21b_number: '',
    billing_address: '',
    shipping_address: '',
  });
  const [newOrder, setNewOrder] = useState<Omit<ManufacturingOrder, "orderId" | "batchNumber" | "status">>({
    productId: "",
    customerId: "",
    productName: "",
    brandName: "",
    customerName: "",
    orderQuantityL: 0,
    packingGroups: [{manufacturing_order_id:0, packingSize: "", numberOfBottles: 0 }], // start with one group
    expectedDeliveryDate: "",
    category: "Human",
    mfgDate: "",
    expDate: "",
    
  });

  // For product and customer search
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productData, error: productError } = await supabase
          .from("product_with_sizes")
          .select("*");
  
        if (productError) throw productError;
        setProducts(productData || []);
  
        // Fetch customers
        const { data: customerData, error: customerError } = await supabase
          .from("customer")
          .select("*");
  
        if (customerError) throw customerError;
        setCustomers(customerData || []);
  
        // Fetch manufacturing orders with packing
        const { data: orderData, error: orderError } = await supabase
          .from("manufacturing_orders_with_packing")
          .select("*");
  
        if (orderError) throw orderError;
  
        // Convert snake_case → PascalCase
        const pascalOrders = (orderData || []).map((order: any) => ({
          orderId: order.order_id,
          productId: order.product_id,
          customerId: order.customer_id,
          productName: order.product_name,
          category: order.category,
          brandName: order.brand_name,
          customerName: order.customer_name,
          packingDetails: order.packing_details, // already JSON array
        }));
  
        setManufacturingOrders(pascalOrders as ManufacturingOrder[]);
        console.log("Orders:", pascalOrders);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
  
    fetchData();
  }, []);
  

  // Generate batch number (only on assignment)
  const generateBatchNumber = (category: "Human" | "Veterinary") => {
    const prefix = category === "Human" ? "SFH25" : "SFV25";
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}${month}${day}${randomNum}`;
  };

  // Product selected for packing sizes
  const selectedProduct = products.find(p => p.external_id === newOrder.productId);
  const filteredPackingSizes = selectedProduct ? selectedProduct.packing_sizes : [];

  // Filter products and customers by search term
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.external_id.toString().includes(productSearch.toLowerCase()) ||
    p.sales_description.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.customer_code.toString().includes(customerSearch.toLowerCase())
  );

  // Get color based on status
  const getStatusColor = (status: ManufacturingOrder["status"]) => {
    switch (status) {
      case "Unassigned": return "bg-gray-100 text-gray-800";
      case "Under Production": return "bg-yellow-100 text-yellow-800";
      case "Filling": return "bg-blue-100 text-blue-800";
      case "Labelling": return "bg-purple-100 text-purple-800";
      case "Packing": return "bg-orange-100 text-orange-800";
      case "Ready to Dispatch": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Add a packing group (packing size + bottles)
  const addPackingGroup = () => {
    setNewOrder({
      ...newOrder,
      packingGroups: [...newOrder.packingGroups, {manufacturing_order_id: 0, packingSize: "", numberOfBottles: 0 }],
    });
  };

  // Remove packing group by index
  const removePackingGroup = (index: number) => {
    if (newOrder.packingGroups.length === 1) return; // at least one group must exist
    const updatedGroups = [...newOrder.packingGroups];
    updatedGroups.splice(index, 1);
    setNewOrder({ ...newOrder, packingGroups: updatedGroups });
  };

  // Handle change in packing group inputs
  const updatePackingGroup = (index: number, key: keyof PackingGroup, value: string | number) => {
    const updatedGroups = [...newOrder.packingGroups];
    updatedGroups[index] = { ...updatedGroups[index], [key]: value };
    setNewOrder({ ...newOrder, packingGroups: updatedGroups });
  };

  // Handle new order submission - with Supabase insert
  const handleAddOrder = async () => {
    if (!newOrder.productName || !newOrder.brandName || !newOrder.customerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate packing groups
    for (const group of newOrder.packingGroups) {
      if (!group.packingSize || group.numberOfBottles <= 0) {
        toast({
          title: "Error",
          description: "Please fill all packing size and bottles fields correctly.",
          variant: "destructive",
        });
        return;
      }
    }

    // 1️⃣ Insert manufacturing order
    const { data: orderData, error: orderError } = await supabase
      .from("manufacturing_orders")
      .insert([{
        product_id: newOrder.productId,
        customer_id: newOrder.customerId,
        product_name: newOrder.productName,
        order_quantity: newOrder.orderQuantityL,
        category: newOrder.category,
        brand_name: newOrder.brandName,
        customer_name: newOrder.customerName,
        // optionally store other fields like dates or status
      }])
      .select();

    if (orderError) {
      console.error(orderError);
      toast({ title: "Error", description: "Failed to add manufacturing order", variant: "destructive" });
      return;
    }

    const insertedOrderId = orderData[0].order_id;

    // 2️⃣ Insert packing groups
    const packingRows = newOrder.packingGroups.map(group => ({
      packing_size: group.packingSize,
      no_of_bottles: group.numberOfBottles,
      manufacturing_order_id: insertedOrderId
    }));

    const { error: packingError } = await supabase
      .from("packing_groups")
      .insert(packingRows);

    if (packingError) {
      console.error(packingError);
      toast({ title: "Error", description: "Failed to add packing groups", variant: "destructive" });
      return;
    }

    // 3️⃣ Update local state (optional if you also re-fetch from DB)
    setManufacturingOrders([...manufacturingOrders, {
      ...orderData[0],
      packingGroups: newOrder.packingGroups
    }]);

    // 4️⃣ Reset form
    setNewOrder({
      productId: "",
      customerId: "",
      productName: "",
      brandName: "",
      customerName: "",
      orderQuantityL: 0,
      packingGroups: [{ manufacturing_order_id: 0, packingSize: "", numberOfBottles: 0 }],
      expectedDeliveryDate: "",
      category: "Human",
      mfgDate: "",
      expDate: "",
    });
    setShowAddForm(false);

    toast({
      title: "Success",
      description: "Manufacturing order created successfully",
    });
  };

  const handleCreateOrder = async () => {
    try {
      // Step 1: Insert into manufacturing_orders
      const { data: orderData, error: orderError } = await supabase
        .from('manufacturing_orders')
        .insert([{
          product_id: newOrder.productId,
          customer_id: newOrder.customerId,
          product_name: newOrder.productName,
          order_quantity: newOrder.orderQuantityL,
          category: newOrder.category,
          brand_name: newOrder.brandName,
          customer_name: newOrder.customerName
        }])
        .select()
        .single();
  
      if (orderError) throw orderError;
  
      // Step 2: Insert related packing groups
      const packingGroupInserts = newOrder.packingGroups.map(packing => ({
        packing_size: packing.packingSize,
        no_of_bottles: packing.numberOfBottles,
        manufacturing_order_id: orderData.order_id // foreign key
      }));
  
      const { error: packingError } = await supabase
        .from('packing_groups')
        .insert(packingGroupInserts);
  
      if (packingError) throw packingError;
  
      alert('Order created successfully!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Error creating order.');
    }
  };
  // Filtering orders by category and search term
  const filteredOrders = manufacturingOrders.filter(order => {
    const search = searchTerm.toLowerCase();
  
    const matchesSearch =
      search || 
      (order.productName ?? "").toLowerCase().includes(search) ||
      (order.brandName ?? "").toLowerCase().includes(search);
  
    const matchesCategory =
      filterCategory === "All" || order.category === filterCategory;
  
    return matchesSearch && matchesCategory;
  });

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    setSelectedOrder(null);
  };

  // Assign or edit batch number in popup
  const assignBatchNumber = (orderId: string) => {
    const batch = generateBatchNumber(selectedOrder?.category ?? "Human");
    setManufacturingOrders((prev) => 
      prev.map(o => o.orderId === orderId ? { ...o, batchNumber: batch } : o)
    );
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, batchNumber: batch });
    }
  };
  // Save edits from modal (including batchNumber, packingGroups etc)
  const saveOrderEdits = () => {
    if (!selectedOrder) return;
    setManufacturingOrders(prev =>
      prev.map(o => o.orderId === selectedOrder.orderId ? selectedOrder : o)
    );
    setSelectedOrder(null);
    toast({ title: "Success", description: "Order updated successfully." });
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

      

      {/* Add Manufacturing Order Form */}
      {showAddForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Create Manufacturing Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Generic Name *</Label>
                <div className="relative">
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => { if (productSearch.length > 0) setShowDropdown(true); }}
                    autoComplete="off"
                  />
                  {showDropdown && productSearch && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredProducts.map((p) => (
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={p.external_id}
                          onClick={() => {
                            setNewOrder({ ...newOrder, productId: p.external_id, productName: p.product_name });
                            setProductSearch(p.product_name);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="text-m text-black-500 mr-2">[{p.external_id}]</span>
                          <span className="text-sm">{p.product_name}</span>
                          <span className="text-gray-400 text-xs"> — {p.sales_description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <div className="relative">
                  <Input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => { if (customerSearch.length > 0) setShowDropdown(true); }}
                    autoComplete="off"
                  />
                  {showDropdown && filteredCustomers.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredCustomers.map((c) => (
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={c.customer_code}
                          onClick={() => {
                            setNewOrder({ ...newOrder, customerId: c.customer_code, customerName: c.customer_name });
                            setCustomerSearch(c.customer_name);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="text-m text-black-500 mr-2">[{c.customer_code}]</span>
                          <span className="text-sm">{c.customer_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">              
              <div>
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  value={newOrder.brandName}
                  onChange={(e) => setNewOrder({ ...newOrder, brandName: e.target.value })}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="orderQuantityL">Order Quantity (L)</Label>
                <Input 
                  id="orderQuantityL"
                  type="number"
                  value={newOrder.orderQuantityL === 0 ? '' : newOrder.orderQuantityL}
                  onChange={(e) => setNewOrder({ ...newOrder, orderQuantityL: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="Enter quantity in L"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newOrder.category}
                  onValueChange={(value: "Human" | "Veterinary") => setNewOrder({ ...newOrder, category: value })}
                >
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
        
            <div>
              <Label>Packing Sizes & Number of Bottles *</Label>
              {newOrder.packingGroups.map((group, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 items-center mb-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={group.packingSize}
                    onChange={e => updatePackingGroup(idx, "packingSize", e.target.value)}
                  >
                    <option value="">Select packing size</option>
                    {filteredPackingSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min={1}
                    placeholder="No. of bottles"
                    value={group.numberOfBottles === 0 ? "" : group.numberOfBottles}
                    onChange={e => updatePackingGroup(idx, "numberOfBottles", Number(e.target.value))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => removePackingGroup(idx)}
                    disabled={newOrder.packingGroups.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addPackingGroup} variant="ghost" className="mt-1">
                + Add packing group
              </Button>
            </div>

            {/* <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={newOrder.expectedDeliveryDate}
                  onChange={(e) => setNewOrder({ ...newOrder, expectedDeliveryDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mfgDate">Manufacturing Date</Label>
                <Input
                  id="mfgDate"
                  type="date"
                  value={newOrder.mfgDate}
                  onChange={(e) => setNewOrder({ ...newOrder, mfgDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expDate">Expiry Date</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={newOrder.expDate}
                  onChange={(e) => setNewOrder({ ...newOrder, expDate: e.target.value })}
                />
              </div>
            </div> */}

            <div className="flex gap-3">
              <Button onClick={() => {handleCreateOrder();}} className="bg-green-500 hover:bg-green-600">
                Create Order
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter Dropdown */}
      <div className="mt-4 w-48">
        <Label htmlFor="categoryFilter">Filter by Category</Label>
        <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val as any)}>
          <SelectTrigger id="categoryFilter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Human">Human</SelectItem>
            <SelectItem value="Veterinary">Veterinary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search input */}
      <Input
        placeholder="Search by product, brand or batch"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No manufacturing orders found.</p>
          </Card>
        ) : ( 
          filteredOrders.map((order) => (
            <Card 
              key={order.orderId} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  
                  {/* LEFT SIDE INFO */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{order.productName}</h3>
                    <p className="text-gray-600 mt-1">
                      Brand: {order.brandName} | Customer: {order.customerName}
                    </p>
          
                    {/* TAGS */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.category === "Human" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                        {order.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        Batch: {order.batchNumber ?? "Unassigned"}
                      </span>
                    </div>
          
                    {/* PACKING SIZES SECTION */}
                    {/* {order.packingDetails && order.packingDetails.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700">Packing Sizes:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {order.packingDetails.map((pack, idx) => (
                            <li key={idx}>
                              {pack.packing_size ? `${pack.packing_size}` : "Unknown Size"} 
                              {pack.no_of_bottles ? ` - ${pack.no_of_bottles} bottles` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )} */}
                  </div>
          
                  {/* RIGHT SIDE INFO */}
                  {/* <div className="text-right text-sm text-gray-500 space-y-1">
                    <p>Quantity: {order.orderQuantityL}ml</p>
                    <p>
                      Bottles: {order.packingDetails?.reduce((acc, p) => acc + (p.no_of_bottles ?? 0), 0) ?? 0}
                    </p>
                    <p>Delivery: {order.expectedDeliveryDate}</p>
                  </div> */}
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* ORDER DETAILS MODAL */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOrder.productName}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p>
                  <b>Category:</b> {selectedOrder.category}
                </p>
                <p>
                  <b>Brand:</b> {selectedOrder.brandName}
                </p>
                <p>
                  <b>Customer:</b> {selectedOrder.customerName}
                </p>

                <div>
                  <Label>Batch/Badge Number</Label>
                  <Input
                    value={selectedOrder.batchNumber ?? ""}
                    onChange={(e) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        batchNumber: e.target.value,
                      })
                    }
                    placeholder="Unassigned"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Packing Groups</Label>
                  <div className="space-y-3">
                    {selectedOrder.packingGroups?.map((group: any, i: number) => (
                      <Card key={i} className="p-4 shadow-sm border rounded-xl">
                        <CardContent className="grid gap-3">
                          <div>
                            <Label>Packing Size</Label>
                            <Input
                              value={group.packingSize}
                              onChange={(e) => {
                                const updated = [...selectedOrder.packingGroups];
                                updated[i].packingSize = e.target.value;
                                setSelectedOrder({
                                  ...selectedOrder,
                                  packingGroups: updated,
                                });
                              }}
                            />
                          </div>

                          <div>
                            <Label>Number of Bottles</Label>
                            <Input
                              type="number"
                              value={group.numberOfBottles}
                              onChange={(e) => {
                                const updated = [...selectedOrder.packingGroups];
                                updated[i].numberOfBottles = Number(e.target.value);
                                setSelectedOrder({
                                  ...selectedOrder,
                                  packingGroups: updated,
                                });
                              }}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (selectedOrder.packingGroups.length <= 1) return;
                                const updated = [...selectedOrder.packingGroups];
                                updated.splice(i, 1);
                                setSelectedOrder({
                                  ...selectedOrder,
                                  packingGroups: updated,
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-3 flex items-center gap-2"
                    onClick={() =>
                      setSelectedOrder({
                        ...selectedOrder,
                        packingGroups: [
                          ...(selectedOrder.packingGroups ?? []),
                          { packingSize: "", numberOfBottles: 0 },
                        ],
                      })
                    }
                  >
                    <Plus className="w-4 h-4" /> Add Packing Group
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Expected Delivery Date</Label>
                    <Input
                      type="date"
                      value={selectedOrder.expectedDeliveryDate}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          expectedDeliveryDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Manufacturing Date</Label>
                    <Input
                      type="date"
                      value={selectedOrder.mfgDate}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          mfgDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={selectedOrder.expDate}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          expDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => deleteOrder(selectedOrder.orderId)}
                >
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={saveOrderEdits}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionTab;
