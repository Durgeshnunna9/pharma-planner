import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Boxes, Package, Pill, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";


interface PackingGroup {
  packing_size: string;
  no_of_bottles: number;
}

interface ManufacturingOrder {
  order_id: string;
  product_id: string;
  customer_id: string;
  product_name: string;
  order_quantity: number;
  category: "Human" | "Veterinary";
  brand_name: string;
  company_name?: string | null;
  batch_number: string | null; // null if unassigned
  expected_delivery_date: string;
  manufacturing_date: string;
  expiry_date: string;
  packing_groups: PackingGroup[]; // multiple groups now
  status: "Unassigned" | "InQueue" | "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch" | "Dispatched";
}

const ProductionTab = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [manufacturingOrderSearch, setManufacturingOrderSearch] = useState("");
  const [selectedManufacturingOrder, setSelectedManufacturingOrder] = useState<ManufacturingOrder | null>(null);
  const [showManufacturingOrderDetails, setShowManufacturingOrderDetails] = useState(false);
  const { toast } = useToast();
  const [newManufacturingOrder, setNewManufacturingOrder] = useState<Omit<ManufacturingOrder, "order_id" >>({
    product_id: "",
    customer_id: "",
    product_name: "",
    brand_name: "",
    company_name: "",
    order_quantity: 0,
    packing_groups: [{ packing_size: "", no_of_bottles: 0 }], // start with one group
    expected_delivery_date: "",
    category: "Human" as "Human" | "Veterinary",
    manufacturing_date: "",
    expiry_date: "",
    batch_number: "",
    status: "Unassigned",

    
  });
  const [filterCategory, setFilterCategory] = useState<"All" | "Human" | "Veterinary">("All");
  const [assignmentFilter, setAssignmentFilter] = useState<"All" | "Assigned" | "Unassigned">("All");
  // For product and customer search
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  // const [packingSize, setPackingSize] = useState<number>(0); // ml
  // const [bottles, setBottles] = useState<number>(0);
  // const [orderQuantity, setOrderQuantity] = useState<number>(0); // L

  // const calculateOrderQuantity = (size: number, count: number) => {
  //   if (!size || !count) return 0;
  //   return (size * count) / 1000; // convert ml → L
  // };

  


  // Fetch products and customers
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  // type ManufacturingOrderEditable = Omit<ManufacturingOrder,  "product_id" | "customer_id">;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    order_id:'',
    product_name: '',
    order_quantity: 0,
    category: 'Human' as 'Human' | 'Veterinary',
    brand_name: '',
    company_name: '',
    packing_groups: [
      { packing_size: "", no_of_bottles: 0}
    ],
    batch_number: "" ,
    status: "Unassigned",
    
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase.from('product_with_sizes').select('*');
      const { data: customerData } = await supabase.from('customer').select('*');
      setProducts(productData || []);
      setCustomers(customerData || []);
    };
    const loadManufacturingOrders = async () => {
      const { data, error } = await supabase
        .from("manufacturing_orders_with_packing")
        .select("*");
  
      if (error) {
        console.error("Failed to load products", error);
      } else {
        const transformedOrders = (data || []).map(manufacturingOrder => ({
          ...manufacturingOrder,
          status: manufacturingOrder.status || "Unassigned", // set default if missing/null
        }));
  
        setManufacturingOrders(transformedOrders);
  
        console.log(transformedOrders);
      }
    };
    loadManufacturingOrders();
    fetchData();
  }, []);

  // let orderCounter = {
  //   Human: 0,
  //   Veterinary: 0
  // };

  // // Generate batch number (only on assignment)
  // const generateBatchNumber = (category: "Human" | "Veterinary") => {
  //   // Choose prefix based on category
  //   const prefix = category === "Human" ? "SFH25" : "SFV25";
    
  //   // Increment counter for this category
  //   orderCounter[category] += 1;
  
  //   // Format as 3-digit padded number (e.g., 001, 002, 003)
  //   const suffix = String(orderCounter[category]).padStart(3, "0");
  
  //   // Combine prefix + suffix
  //   return `${prefix}${suffix}`;
  // };

  // Product selected for packing sizes
  const selectedProduct = products.find(p => p.external_id === newManufacturingOrder.product_id);
  const filteredPackingSizes = selectedProduct ? selectedProduct.packing_sizes : [];

  // Filter products and customers by search term
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.external_id.toString().includes(productSearch.toLowerCase()) ||
    p.sales_description.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) => {
    const companyName = (c.company_name ?? "").toLowerCase();
    const customerId = c.customer_id ? c.customer_id.toString().toLowerCase() : "";
  
    return (
      companyName.includes(customerSearch.toLowerCase()) ||
      customerId.includes(customerSearch.toLowerCase())
    );
  });
  // const totalLiters = newManufacturingOrder.packing_groups.reduce((sum, group) => {
  //   const size = Number(group.packing_size); // in ml
  //   const bottles = Number(group.no_of_bottles);
  //   if (!size || !bottles) return sum;
  //   return sum + (size * bottles) / 1000; // convert ml → L
  // }, 0);
  
  // Get color based on status
  const getStatusColor = (status: ManufacturingOrder["status"]) => {
    switch (status) {
      case "InQueue": return "bg-pink-100 text-pink-800";
      case "Unassigned": return "bg-red-100 text-red-800";
      case "Under Production": return "bg-orange-100 text-orange-500";
      case "Filling": return "bg-yellow-100 text-yellow-800";
      case "Labelling": return "bg-sky-100 text-sky-800";
      case "Packing": return "bg-indigo-100 text-indigo-800";
      case "Ready to Dispatch": return "bg-teal-100 text-teal-800";
      case "Dispatched": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800";
    }
   
  };

  // Add a packing group (packing size + bottles)
  const addPackingGroup = () => {
    setNewManufacturingOrder({
      ...newManufacturingOrder,
      packing_groups: [...newManufacturingOrder.packing_groups, { packing_size: "", no_of_bottles: 0 }],
    });
  };

  // Remove packing group by index
  const removePackingGroup = (index: number) => {
    if (newManufacturingOrder.packing_groups.length === 1) return; // at least one group must exist
    const updatedGroups = [...newManufacturingOrder.packing_groups];
    updatedGroups.splice(index, 1);
    setNewManufacturingOrder({ ...newManufacturingOrder, packing_groups: updatedGroups });
  };

  // Handle change in packing group inputs
  const updatePackingGroup = (index: number, key: keyof PackingGroup, value: string | number) => {
    const updatedGroups = [...newManufacturingOrder.packing_groups];
    updatedGroups[index] = { ...updatedGroups[index], [key]: value };
    setNewManufacturingOrder({ ...newManufacturingOrder, packing_groups: updatedGroups });
  };
  // Calculate total liters from packing groups
  const calculateTotalLiters = (packing_groups: PackingGroup[]) => {
    return packing_groups.reduce((sum, group) => {
      const size = parseFloat(group.packing_size); // handle "60ml", "100ml" strings
      const bottles = Number(group.no_of_bottles);
      
      if (isNaN(size) || isNaN(bottles)) return sum;
      
      return sum + (size * bottles) / 1000; // convert ml → L
    }, 0);
  };

  // Get the current calculated total
  const currentTotalLiters = calculateTotalLiters(newManufacturingOrder.packing_groups);
  const currentEditTotalLiters = calculateTotalLiters(editForm.packing_groups);

  // Update order quantity whenever packing groups change
  useEffect(() => {
    const totalLiters = newManufacturingOrder.packing_groups.reduce(
      (sum, group) => {
        const size = parseFloat(group.packing_size); // handle "60ml", "100ml"
        const bottles = Number(group.no_of_bottles);

        if (isNaN(size) || isNaN(bottles)) return sum;

        return sum + (size * bottles) / 1000; // convert ml → L
      },
      0
    );

    setNewManufacturingOrder((prev) => ({
      ...prev,
      order_quantity: parseFloat(totalLiters.toFixed(2)), // keep 2 decimals
    }));
  }, [newManufacturingOrder.packing_groups]);
  
  // Handle new manufacturingOrder submission - with Supabase insert
  const handleAddManufacturingOrder = async () => {
    if (!newManufacturingOrder.product_name || !newManufacturingOrder.brand_name || !newManufacturingOrder.company_name || !newManufacturingOrder.packing_groups || currentTotalLiters <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate packing groups
    for (const group of newManufacturingOrder.packing_groups) {
      if (!group.packing_size || Number(group.no_of_bottles) <= 0) {
        toast({
          title: "Error",
          description: "Please fill all packing size and bottles fields correctly.",
          variant: "destructive",
        });
        return;
      }
    }
    // 🟢 Convert month-year fields to valid DATE before insert
    let manufacturingDate: string | null = null;
    if (newManufacturingOrder.manufacturing_date) {
      // assuming manufacturing_date is coming in as "2025-09"
      manufacturingDate = `${newManufacturingOrder.manufacturing_date}-01`;
    }

    let expiryDate: string | null = null;
    if (newManufacturingOrder.expiry_date) {
      expiryDate = `${newManufacturingOrder.expiry_date}-01`;
    }

    // 1️⃣ Insert Manufacturing Order
    const { data: manufacturingOrderData, error: manufacturingOrderError } = await supabase
      .from("manufacturing_orders")
      .insert([{
        product_id: newManufacturingOrder.product_id,
        customer_id: newManufacturingOrder.customer_id,
        product_name: newManufacturingOrder.product_name,
        order_quantity: currentTotalLiters,
        category: newManufacturingOrder.category,
        brand_name: newManufacturingOrder.brand_name,
        company_name: newManufacturingOrder.company_name,
        manufacturing_date: newManufacturingOrder.manufacturing_date ? `${newManufacturingOrder.manufacturing_date}-01` : null,  // 🟢 use converted date
        expiry_date: newManufacturingOrder.expiry_date ? `${newManufacturingOrder.expiry_date}-01` : null, // 🟢 use converted date
        status: newManufacturingOrder.status || "Unassigned",
        // optionally store other fields like dates or status
      }])
      .select();

    if (manufacturingOrderError) {
      console.error(manufacturingOrderError);
      toast({ title: "Error", description: "Failed to add Manufacturing Order", variant: "destructive" });
      return;
    }

    const insertedOrderId = manufacturingOrderData[0].order_id;

    // 2️⃣ Insert packing groups
    const packingRows = newManufacturingOrder.packing_groups.map(group => ({
      packing_size: group.packing_size,
      no_of_bottles: group.no_of_bottles,
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
      ...manufacturingOrderData[0],
      order_quantity: currentTotalLiters,
      packing_groups: newManufacturingOrder.packing_groups
    }]);

    // 4️⃣ Reset form
    setNewManufacturingOrder({
      product_id: "",
      customer_id: "",
      product_name: "",
      order_quantity: 0,
      category: "Human",
      brand_name: "",
      company_name: "",
      packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
      expected_delivery_date: "",
      manufacturing_date: "",
      expiry_date: "",
      batch_number: "",
      status: "Unassigned"
    });
    setShowAddForm(false);

    toast({
      title: "Success",
      description: "Manufacturing Order created successfully",
    });
  };

  const handleManufacturingOrderClick = (manufacturingOrder: ManufacturingOrder) => {
    setSelectedManufacturingOrder(manufacturingOrder);
    setShowManufacturingOrderDetails(true);
  };
  // const handleCreateOrder = async () => {
  //   try {
  //     // Step 1: Insert into manufacturing_orders
  //     const { data: manufacturingOrderData, error: manufacturingOrderError } = await supabase
  //       .from('manufacturing_orders')
  //       .insert([{
  //         product_id: newManufacturingOrder.product_id,
  //         customer_id: newManufacturingOrder.customer_id,
  //         product_name: newManufacturingOrder.product_name,
  //         order_quantity: newManufacturingOrder.order_quantity,
  //         category: newManufacturingOrder.category,
  //         brand_name: newManufacturingOrder.brand_name,
  //         company_name: newManufacturingOrder.company_name
  //       }])
  //       .select()
  //       .single();
  
  //     if (manufacturingOrderError) throw manufacturingOrderError;
  
  //     // Step 2: Insert related packing groups
  //     const packingGroupInserts = newManufacturingOrder.packing_groups.map(packing => ({
  //       packing_size: packing.packing_size,
  //       no_of_bottles: packing.no_of_bottles,
  //       manufacturing_order_id: manufacturingOrderData.order_id // foreign key
  //     }));
  
  //     const { error: packingError } = await supabase
  //       .from('packing_groups')
  //       .insert(packingGroupInserts);
  
  //     if (packingError) throw packingError;
  
  //     alert('Order created successfully!');
  //   } catch (err) {
  //     console.error('Error creating manufacturingOrder:', err);
  //     alert('Error creating manufacturingOrder.');
  //   }
  // };
  
  // Filtering orders by category and search term
  const filteredManufacturingOrder = manufacturingOrders.filter(manufacturingOrder => {
    const search = manufacturingOrderSearch.toLowerCase();
  
    const matchesSearch =
      (manufacturingOrder.product_name ?? "").toLowerCase().includes(search) ||
      (manufacturingOrder.company_name ?? "").toLowerCase().includes(search) ||
      (manufacturingOrder.brand_name ?? "").toLowerCase().includes(search);
  
    const matchesCategory =
      filterCategory === "All" || manufacturingOrder.category === filterCategory;

    const matchesStatus =
      assignmentFilter === "All" || manufacturingOrder.status === assignmentFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // useEffect(() => {
  //   if (!isOpen) {
  //     setIsEditing(false); // reset edit mode whenever modal closes
  //   }
  // }, [isOpen]);

  // Assign or edit batch number in popup
  const assignBatchNumber = async (orderId: string, category: "Human" | "Veterinary") => {
    try {
      // Call the correct function depending on category
      const fnName = category === "Human" ? "increment_human_batch" : "increment_veterinary_batch";
      
      const { data, error } = await supabase.rpc(fnName);
      if (error) throw error;
  
      const newCount = data as number;
      const prefix = category === "Human" ? "SFH25" : "SFV25"; // adjust year prefix if needed
      const batch = `${prefix}${String(newCount).padStart(3, "0")}`;
  
      // Save batch number back to the order in DB
      const { error: updateError } = await supabase
        .from("manufacturing_orders")
        .update({ batch_number: batch })
        .eq("order_id", orderId);
  
      if (updateError) throw updateError;
  
      // Update local state too
      setManufacturingOrders(prev =>
        prev.map(o => o.order_id === orderId ? { ...o, batch_number: batch } : o)
      );
  
      if (selectedManufacturingOrder?.order_id === orderId) {
        setSelectedManufacturingOrder({ ...selectedManufacturingOrder, batch_number: batch });
      }
  
      return batch;
    } catch (err) {
      console.error("Error assigning batch number:", err);
      return null;
    }
  };
  // Save edits from modal (including batch_number, packing_groups etc)
  // const saveOrderEdits = () => {
  //   if (!selectedManufacturingOrder) return;
  //   setManufacturingOrders(prev =>
  //     prev.map(o => o.order_id === selectedManufacturingOrder.order_id ? selectedManufacturingOrder : o)
  //   );
  //   setSelectedManufacturingOrder(null);
  //   toast({ title: "Success", description: "Order updated successfully." });
  // };
  
  const sortedOrders = [...filteredManufacturingOrder].sort(
    (a, b) => Number(b.order_id) - Number(a.order_id)
  );

  // const assignedOrders = sortedOrders.filter(order => order.batch_number !== null && order.status !== "Unassigned");
  // const unassignedOrders = sortedOrders.filter(order => order.batch_number === null || order.status === "Unassigned");

  const filteredOrdersByAssignment = sortedOrders.filter(order => {
    if (assignmentFilter === "Assigned") {
      return order.batch_number && order.batch_number !== "Unassigned";
    }
    if (assignmentFilter === "Unassigned") {
      return !order.batch_number || order.batch_number === "Unassigned";
    }
    return true; // "all"
  });

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
                <Label htmlFor="product_name">Product Generic Name *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => { if (productSearch.length > 0) setShowProductDropdown(true); }}
                    autoComplete="off"
                    placeholder="Enter your Product Details"
                    className="pl-8 "
                  />
                  {showProductDropdown && productSearch && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredProducts.map((p) => (
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={p.external_id}
                          onClick={() => {
                            setNewManufacturingOrder({ ...newManufacturingOrder, product_id: p.external_id, product_name: p.product_name });
                            setProductSearch(p.product_name);
                            setShowProductDropdown(false);
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
                <Label htmlFor="company_name">Company Name *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    placeholder="Enter your Company Details"
                    onFocus={() => { if (customerSearch.length > 0) setShowCustomerDropdown(true); }}
                    autoComplete="off"
                    className="pl-8"
                  />
                  {showCustomerDropdown && customerSearch && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredCustomers.map((c) => (
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={c.customer_id}
                          onClick={() => {
                            setNewManufacturingOrder({ ...newManufacturingOrder, customer_id: c.customer_code, company_name: c.company_name });
                            setCustomerSearch(c.company_name);
                            setShowCustomerDropdown(false);
                          }}
                        >
                          <span className="text-m text-black-500 mr-2">[{c.customer_code}]</span>
                          <span className="text-sm">{c.company_name && c.company_name.trim() !== "" ? c.company_name : "Nil"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">              
              <div>
                <Label htmlFor="brand_name">Brand Name *</Label>
                <Input
                  id="brand_name"
                  value={newManufacturingOrder.brand_name}
                  onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, brand_name: e.target.value })}
                  placeholder="Enter brand name"
                />
              </div>
              {/* Order Quantity Auto Calculation */}
              <div>
                <Label htmlFor="order_quantity">Order Quantity (L)</Label>
                <Input
                  id="order_quantity"
                  type="number"
                  value={currentTotalLiters.toFixed(2)}
                  placeholder="Auto-calculated from packing"
                  readOnly // 👈 prevents manual editing
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Calculated from: {newManufacturingOrder.packing_groups
                    .filter(group => group.packing_size && group.no_of_bottles > 0)
                    .map((group, idx) => 
                      `${group.packing_size}ml × ${group.no_of_bottles} bottles`
                    ).join(' + ') || 'No packing groups defined'}
                </p>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newManufacturingOrder.category}
                  onValueChange={(value: "Human" | "Veterinary") => setNewManufacturingOrder({ ...newManufacturingOrder, category: value })}
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
              {newManufacturingOrder.packing_groups.map((group, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 items-center mb-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={group.packing_size}
                    onChange={e => updatePackingGroup(idx, "packing_size", e.target.value)}
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
                    value={group.no_of_bottles === 0 ? "" : group.no_of_bottles}
                    onChange={e => updatePackingGroup(idx, "no_of_bottles", Number(e.target.value))}
                  />

                  <Button
                    variant="outline"
                    onClick={() => removePackingGroup(idx)}
                    disabled={newManufacturingOrder.packing_groups.length === 1}
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
                <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                <Input
                  id="expected_delivery_date"
                  type="date"
                  value={newManufacturingOrder.expected_delivery_date}
                  onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, expected_delivery_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="manufacturing_date">Manufacturing Date</Label>
                <Input
                  id="manufacturing_date"
                  type="date"
                  value={newManufacturingOrder.manufacturing_date}
                  onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, manufacturing_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={newManufacturingOrder.expiry_date}
                  onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, expiry_date: e.target.value })}
                />
              </div>
            </div> */}

            <div className="flex gap-3">
              <Button onClick={() => {handleAddManufacturingOrder()}} className="bg-green-500 hover:bg-green-600">
                Create Order
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/*Filters*/}
      <div className="grid grid-cols-6">
        {/* Category Filter Dropdown */}
        <div className=" w-48">
          {/* <Label htmlFor="categoryFilter" className="mb-2">Filter by Category</Label> */}
          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val as any)}>
            <SelectTrigger id="categoryFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Human">Human</SelectItem>
              <SelectItem value="Veterinary">Veterinary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter of assignment */}
        <div className=" w-48">
          {/* <Label htmlFor="categoryFilter" >Filter by Status</Label> */}
          <Select value={assignmentFilter} onValueChange={(val) => setAssignmentFilter(val as any)}>
            <SelectTrigger id="categoryFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              
              <SelectItem value="All">Assigned</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Search input */}
        <div className="relative  col-span-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by product, brand, company "
            value={manufacturingOrderSearch}
            onChange={e => setManufacturingOrderSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {/* <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAssignmentFilter("all")}
          className={`px-4 py-2 rounded ${assignmentFilter === "all" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setAssignmentFilter("assigned")}
          className={`px-4 py-2 rounded ${assignmentFilter === "assigned" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Assigned
        </button>
        <button
          onClick={() => setAssignmentFilter("unassigned")}
          className={`px-4 py-2 rounded ${assignmentFilter === "unassigned" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Unassigned
        </button>
      </div> */}

      

      


      {/* Orders List */}
      <div className="grid gap-4 ">
        {filteredOrdersByAssignment.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No manufacturing orders found.</p>
          </Card>
        ) : (
          filteredOrdersByAssignment.map((manufacturingOrder) => (
            <Card 
              key={manufacturingOrder.order_id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleManufacturingOrderClick(manufacturingOrder)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="mt-3 mr-3 p-2 bg-gray-100 rounded-xl">
                    <Package className="w-7 h-8"/>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{manufacturingOrder.product_name}</h3>
                    <p className="text-gray-600 mt-1">
                      Brand: {manufacturingOrder.brand_name} | Company: {manufacturingOrder.company_name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-violet-100 text-gray-700 rounded text-xs">
                        Batch: {manufacturingOrder.batch_number ?? "Unassigned"}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        manufacturingOrder.category === "Human" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {manufacturingOrder.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(manufacturingOrder.status)}`}>
                        {manufacturingOrder.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 space-y-1">
                    <p>Quantity: {manufacturingOrder.order_quantity || "0"}L</p>
                    <p>Delivery: {manufacturingOrder.expected_delivery_date || "N.A"} </p>
                    <p>Manufacturing: {manufacturingOrder.manufacturing_date || "N.A"}</p>
                    <p>Expiry: {manufacturingOrder.expiry_date || "N.A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


      {/* Order Details Modal */}
      <Dialog open={showManufacturingOrderDetails} onOpenChange={(open) => {
          setShowManufacturingOrderDetails(open);

          if (!open && isEditing) {
            // Reset edit mode and form when modal closes
            setIsEditing(false);
            setEditForm({
              order_id:selectedManufacturingOrder.order_id,
              product_name: selectedManufacturingOrder.product_name,
              category: selectedManufacturingOrder.category,
              order_quantity: selectedManufacturingOrder.order_quantity,
              brand_name: selectedManufacturingOrder.brand_name,
              company_name: selectedManufacturingOrder.company_name,
              packing_groups: [...selectedManufacturingOrder.packing_groups],
              batch_number: selectedManufacturingOrder.batch_number,
              status: selectedManufacturingOrder.status,
            });
          }
        }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-800 mb-2 border-b-2 border-gray-200 pb-1">Manufacturing Order Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedManufacturingOrder && (
            <div className="space-y-6">
              {/* ManufacturingOrder Header */}
              <div className="border-b pb-4">
                <div>
                  <p className="text-xl text-gray-900 mb-2">
                    {isEditing ? (
                      <div className="relative">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Product: </p>
                          <Input
                            value={editForm.product_name}
                            onChange={(e) => {
                              setEditForm({ ...editForm, product_name: e.target.value });
                              setShowProductDropdown(true);
                            }}
                            onFocus={() => {
                              if (editForm.product_name.length > 0) setShowProductDropdown(true);
                            }}
                            autoComplete="off"
                            placeholder="Enter your product details"
                          />
                        </div>
                        {showProductDropdown && editForm.product_name && (
                          <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                            {filteredProducts.map((p) => (
                              <li
                                key={p.external_id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setEditForm({
                                    ...editForm,
                                    product_name: p.product_name,
                                  });
                                  setShowProductDropdown(false);
                                }}
                              >
                                <span className="text-sm text-black-500 mr-2">[{p.external_id}]</span>
                                <span className="text-sm">{p.product_name}</span>
                                <span className="text-gray-400 text-xs"> — {p.sales_description}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-gray-900 ">Product:  <span className="text-sm font-semibold">{selectedManufacturingOrder.product_name}</span> </p>
                      </div>
                    )}
                  </p>
                </div>

                {/*ManufacturingOrder Company Name */}
                <div>
                  <p className="text-xl text-gray-900 mb-2">
                    {isEditing ? (
                      <div className="relative">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Company: </p>
                          <Input
                            value={editForm.company_name}
                            onChange={(e) => {
                              setEditForm({ ...editForm, company_name: e.target.value });
                              setShowCustomerDropdown(true);
                            }}
                            onFocus={() => {
                              if (editForm.company_name.length > 0) setShowCustomerDropdown(true);
                            }}
                            autoComplete="off"
                            placeholder="Enter your company details"
                          />
                        </div>
                        {showCustomerDropdown && editForm.company_name && (
                          <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                            {filteredCustomers.map((c) => (
                              <li
                                key={c.customer_id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setEditForm({
                                    ...editForm,
                                    company_name: c.company_name,
                                  });
                                  setShowCustomerDropdown(false);
                                }}
                              >
                                <span className="text-sm text-black-500 mr-2">[{c.customer_id}]</span>
                                <span className="text-sm">{c.company_name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-gray-900 ">Company:  <span className="text-sm font-semibold">{selectedManufacturingOrder.company_name}</span> </p>
                        
                      </div>
                    )}
                  </p>
                </div>
                {/*Manufacturing Order category */}
                <div className="flex items-center gap-6">
                  {isEditing ? (
                    <Select
                      value={editForm.category}
                      onValueChange={value => setEditForm({ ...editForm, category: value as 'Human' | 'Veterinary' })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Human">Human</SelectItem>
                        <SelectItem value="Veterinary">Veterinary</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedManufacturingOrder.category === "Human"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>{selectedManufacturingOrder.category}</span>

                  )}
                </div>
              </div>

              {/* ManufacturingOrder Quantity(L) */}
              <div>
                {isEditing ? (
                  <div className="flex flex-col">
                    <Label htmlFor="order_quantity" className="text-sm font-bold text-gray-900 pb-1">Order Quantity (L)</Label>
                    <Input
                      id="order_quantity"
                      type="number"
                      value={currentEditTotalLiters.toFixed(2)}
                      placeholder="Auto-calculated from packing"
                      readOnly // 👈 prevents manual editing
                      className="bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <h3 className="text-sm font-bold text-gray-900">
                      Order Quantity (L):
                    </h3>
                    <span className="text-sm">{selectedManufacturingOrder.order_quantity}L</span>
                  </div>
                )}
              </div>
              
              {/* Packing Groups */}
              {editForm.packing_groups.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Packing Groups : </h3>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      {editForm.packing_groups.map((group, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-3 items-center">
                          <select
                            className="border rounded px-2 py-1"
                            value={group.packing_size}
                            onChange={e => {
                              const updated = [...editForm.packing_groups];
                              updated[idx] = { ...updated[idx], packing_size: e.target.value };
                              setEditForm({ ...editForm, packing_groups: updated });
                            }}
                          >
                            <option value="">Select packing size</option>
                            {(products.find(p => p.external_id === selectedManufacturingOrder.product_id)?.packing_sizes || []).map((size: string) => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            min={0}
                            value={group.no_of_bottles === 0 ? "" : group.no_of_bottles}
                            onChange={e => {
                              const updated = [...editForm.packing_groups];
                              updated[idx] = { ...updated[idx], no_of_bottles: e.target.value === "" ? 0 : Number(e.target.value)};
                              setEditForm({ ...editForm, packing_groups: updated });
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (editForm.packing_groups.length <= 1) return;
                              const updated = editForm.packing_groups.filter((_, i) => i !== idx);
                              setEditForm({ ...editForm, packing_groups: updated.length ? updated : [{ packing_size: '', no_of_bottles: 0 }] });
                            }}
                            disabled={editForm.packing_groups.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditForm({ ...editForm, packing_groups: [...editForm.packing_groups, { packing_size: '', no_of_bottles: 0 }] })}
                      >
                        + Add Packing Group
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedManufacturingOrder.packing_groups?.map((group, index) => (
                        <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                          {group.packing_size} : {group.no_of_bottles}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ):(
                <div>
                  <p className="text-sm"><span className="text-lg font-semibold text-gray-900">Packing Group :</span> No Packing groups have been chosen</p>
                </div>
              )}

              {/* Manufacturing Order Brand Name */}
              <div>
                {isEditing ? (
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-900 mb-1">
                      Brand Name
                    </label>
                    <Input
                    value={editForm.brand_name}
                    onChange={e => setEditForm({ ...editForm, brand_name: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <h3 className="text-sm font-bold text-gray-900">
                    Brand Name :
                    </h3>
                    <span className="text-sm">{selectedManufacturingOrder.brand_name}</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="my-4 grid grid-cols-3 gap-4">
              {isEditing ? (
                  <div className="flex flex-col">
                    <Label className="pb-1 text-sm font-bold text-gray-900">Expected Delivery Date</Label>
                      <Input
                        type="date"
                        value={selectedManufacturingOrder.expected_delivery_date}
                        onChange={e => setSelectedManufacturingOrder({ ...selectedManufacturingOrder, expected_delivery_date: e.target.value })}
                      />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <p className="text-sm font-bold text-gray-900">
                    Expected Delivery Date :
                    </p>
                    <span className="text-sm">{selectedManufacturingOrder.expected_delivery_date || "N.A"}</span>
                  </div>
                )}
                {isEditing ? (
                  <div className="flex flex-col">
                    <Label className="text-sm font-bold text-gray-900 pb-1">Manufacturing Date</Label>
                      <Input
                        type="date"
                        value={selectedManufacturingOrder.manufacturing_date}
                        onChange={e => setSelectedManufacturingOrder({ ...selectedManufacturingOrder, manufacturing_date: e.target.value })}
                      />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <p className="text-sm font-bold text-gray-900 ">
                    Manufacturing Date :
                    </p>
                    <span className="text-sm">{selectedManufacturingOrder.manufacturing_date || "N.A"}</span>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col">
                    <Label className="pb-1 text-sm font-bold text-gray-900">Expiry Date</Label>
                      <Input
                        type="date"
                        value={selectedManufacturingOrder.expiry_date}
                        onChange={e => setSelectedManufacturingOrder({ ...selectedManufacturingOrder, expiry_date: e.target.value })}
                      />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <p className="text-sm font-bold text-gray-900">
                    Expiry Date :
                    </p>
                    <span className="text-sm">{selectedManufacturingOrder.expiry_date || "N.A"}</span>
                  </div>
                )}
              </div>

              {/* Batch Number */}
              {isEditing?(
                <div className="my-4">
                  <Label className="pb-1 text-sm font-bold text-gray-900">Batch Number</Label>
                  <Input
                    value={editForm.batch_number ?? ""}
                    onChange={e => setEditForm({ ...editForm, batch_number: e.target.value })}
                    placeholder="Unassigned"
                    
                  />
                  {!editForm.batch_number && (
                    <Button
                      className="mt-2 text-bold"
                      onClick={async () => {
                        const batch = await assignBatchNumber(editForm.order_id, editForm.category ?? "Human");
                        setEditForm({ ...editForm, batch_number: batch });
                      }}
                    >
                      Assign Badge Number
                    </Button>
                  )}
                </div>
                ):(
                  <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                    <p className="text-sm font-bold text-gray-900 ">
                    Batch Number :
                    </p>
                    <span className="text-sm">{selectedManufacturingOrder.batch_number || "Unassigned"}</span>
                  </div>
                )}
               
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    {/* SAVE BUTTON */}
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={async () => {
                        // 1) Update core manufacturing order fields
                        const { error: orderError } = await supabase
                        .from('manufacturing_orders')
                        .update({
                          product_name: editForm.product_name,
                          category: editForm.category,
                          order_quantity: editForm.order_quantity,
                          brand_name: editForm.brand_name,
                          company_name: editForm.company_name,
                          expected_delivery_date: selectedManufacturingOrder.expected_delivery_date,
                          manufacturing_date: selectedManufacturingOrder.manufacturing_date,
                          expiry_date: selectedManufacturingOrder.expiry_date,
                          batch_number: editForm.batch_number, // ✅ FIXED (was selectedManufacturingOrder.batch_number)
                          status: selectedManufacturingOrder.status === "Unassigned" && editForm.batch_number
                          ? "InQueue"
                          : selectedManufacturingOrder.status, // ✅ fixed condition
                        })
                        .eq('order_id', selectedManufacturingOrder.order_id);

                        if (orderError) {
                          console.error(orderError);
                          toast({ title: 'Error', description: 'Failed to update manufacturing order.' });
                          return;
                        }

                        // 2) Replace packing groups for this order
                        const { error: delErr } = await supabase
                          .from('packing_groups')
                          .delete()
                          .eq('manufacturing_order_id', selectedManufacturingOrder.order_id);

                        if (delErr) {
                          console.error(delErr);
                          toast({ title: 'Error', description: 'Failed to update packing groups.' });
                          return;
                        }

                        const rows = (editForm.packing_groups || [])
                          .filter(g => g.packing_size && g.no_of_bottles > 0)
                          .map(g => ({
                            manufacturing_order_id: selectedManufacturingOrder.order_id,
                            packing_size: g.packing_size,
                            no_of_bottles: g.no_of_bottles,
                          }));

                        if (rows.length) {
                          const { error: insErr } = await supabase.from('packing_groups').insert(rows);
                          if (insErr) {
                            console.error(insErr);
                            toast({ title: 'Error', description: 'Failed to insert packing groups.' });
                            return;
                          }
                        }

                        // 3) Update local state
                        const updated = {
                          ...selectedManufacturingOrder,
                          product_name: editForm.product_name,
                          category: editForm.category,
                          order_quantity: editForm.order_quantity,
                          brand_name: editForm.brand_name,
                          company_name: editForm.company_name,
                          packing_groups: editForm.packing_groups,
                          expected_delivery_date: selectedManufacturingOrder.expected_delivery_date,
                          manufacturing_date: selectedManufacturingOrder.manufacturing_date,
                          expiry_date: selectedManufacturingOrder.expiry_date,
                          batch_number: editForm.batch_number, // ✅ use editForm
                          status: selectedManufacturingOrder.status === "Unassigned" && editForm.batch_number
                          ? "InQueue"
                          : selectedManufacturingOrder.status, // ✅ fixed condition
                        };

                        setManufacturingOrders(prev =>
                          prev.map(o => o.order_id === updated.order_id ? updated : o)
                        );
                        setSelectedManufacturingOrder(updated);
                        setIsEditing(false);

                        toast({
                          title: 'Manufacturing order updated',
                          description: 'Details updated successfully.'
                        });
                      }}
                    >
                      Save
                    </Button>


                    {/* CANCEL BUTTON */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          order_id: selectedManufacturingOrder.order_id,
                          product_name: selectedManufacturingOrder.product_name,
                          category: selectedManufacturingOrder.category,
                          order_quantity:selectedManufacturingOrder.order_quantity,
                          brand_name:selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...selectedManufacturingOrder.packing_groups],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {/* EDIT BUTTON */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          order_id: selectedManufacturingOrder.order_id,
                          product_name: selectedManufacturingOrder.product_name,
                          category: selectedManufacturingOrder.category,
                          order_quantity:selectedManufacturingOrder.order_quantity,
                          brand_name:selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...(selectedManufacturingOrder.packing_groups || [])],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit ManufacturingOrder
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this Manufacturing Order?")) return;

                        // 1️⃣ Delete packing_sizes first
                        const { error: packingError } = await supabase
                          .from("packing_groups")
                          .delete()
                          .eq("manufacturing_order_id", selectedManufacturingOrder.order_id);

                        if (packingError) {
                          console.error(packingError);
                          toast({ title: "Error", description: "Failed to remove packing group." });
                          return;
                        }

                        // 2️⃣ Delete Manufacturing Order
                        const { error: manufacturingOrderError } = await supabase
                          .from("manufacturing_orders")
                          .delete()
                          .eq("order_id", selectedManufacturingOrder.order_id);

                        if (manufacturingOrderError) {
                          console.error(manufacturingOrderError);
                          toast({ title: "Error", description: "Failed to delete Manufacturing Order." });
                          return;
                        }

                        // 3️⃣ Update local state
                        setManufacturingOrders(prevOrders => prevOrders.filter(p => p.order_id !== selectedManufacturingOrder.order_id));
                        setShowManufacturingOrderDetails(false);

                        toast({ title: "Deleted", description: "ManufacturingOrder deleted successfully." });
                      }}
                    >
                      Delete Manufacturing Order
                    </Button>

                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionTab;
