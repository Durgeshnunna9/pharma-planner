
import { useState,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Package2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";
import { Product } from "@/lib/products";

interface ManufacturingOrder {
  productId: string;
  customerId: string;
  orderId: string;
  productGenericName: string;
  brandName: string;
  customerName: string;
  orderQuantityL: number;
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
  
  const [showProductDetails, setShowProductDetails] = useState(false);

  const [newOrder, setNewOrder] = useState({
    productId: "",
    customerId: "",
    productGenericName: "",
    brandName: "",
    customerName: "",
    orderQuantityL: 0,
    packingSize: "",
    numberOfBottles: 0,
    expectedDeliveryDate: "",
    category: "Human" as "Human" | "Veterinary",
    mfgDate: "",
    expDate: "",
  });
  
  // Generating a batch number for the manufacturing order
  const generateBatchNumber = (category: "Human" | "Veterinary") => {
    const prefix = category === "Human" ? "SFH25" : "SFV25";
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}${month}${day}${randomNum}`;
  };

  // Fetching products and customers from the database
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase
        .from('product_with_sizes')
        .select('*');

      const { data: customerData } = await supabase
        .from('customer')
        .select('*');

      setProducts(productData || []);
      setCustomers(customerData || []);
    };

    fetchData();
  }, []);
  
  // Adding a new manufacturing order
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
      orderId: Date.now().toString(),
      ...newOrder,
      batchNumber: generateBatchNumber(newOrder.category),
      status: "Under Production",
    };

    setManufacturingOrders([...manufacturingOrders, order]);
    setNewOrder({
      productId: "",
      customerId: "",
      productGenericName: "",
      brandName: "",
      customerName: "",
      orderQuantityL: 0,
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

  // Handling the product click
//   const handleProductClick = (product: Product) => {
//     setSelectedProduct(product);
//     setShowProductDetails(true);
//   };

  // Getting the packing sizes for the products
  const selectedProduct = products.find(p => p.external_id === newOrder.productId);
  const filteredPackingSizes = selectedProduct ? selectedProduct.packing_sizes : [];

  // Filtering the orders based on the search term
  const filteredOrders = manufacturingOrders.filter(order =>
    order.productGenericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtering the orders based on the search term
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Filtering the products based on the search term
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.external_id.toString().includes(productSearch.toLowerCase()) ||
    p.sales_description.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtering the customers based on the search term
  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.customer_code.toString().includes(customerSearch.toLowerCase())
  );

  // Getting the status color for the manufacturing order
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
  // Function to create a db entry
  const handleCreateOrder = async () => {
    try {
      // Step 1: Insert into manufacturing_orders
      const { data: orderData, error: orderError } = await supabase
        .from('manufacturing_orders')
        .insert([{
          product_id: newOrder.productId,
          customer_id: newOrder.customerId,
          product_name: newOrder.productGenericName,
          order_quantity: newOrder.orderQuantity,
          category: newOrder.category,
          brand_name: newOrder.brandName,
          customer_name: newOrder.customerName
        }])
        .select()
        .single();
  
      if (orderError) throw orderError;
  
      // Step 2: Insert related packing groups
      const packingGroupInserts = newOrder.packingDetails.map(packing => ({
        packing_size: packing.size,
        no_of_bottles: packing.count,
        manufacturin: orderData.order_id // foreign key
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

  const [showDropdown, setShowDropdown] = useState(false);

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
                <Label htmlFor="productGenericName">Product Generic Name *</Label>
                
                <div className="relative">
                  {/* Product search String */}
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => { if(productSearch.length > 0) setShowDropdown(true) }}
                  />

                  {showDropdown && productSearch && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredProducts.map((p) => (
                        <li className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={p.external_id}
                          onClick={() => {
                            setNewOrder({ ...newOrder, productId: p.external_id, productGenericName: p.product_name });
                            setProductSearch(p.product_name);
                            setShowDropdown(false); // close dropdown
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
                <div className="relative">
                  {/* Customer search String */}
                  <Input
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    // onChange={onChangeHandler}
                    onFocus={() => { if(customerSearch.length > 0) setShowDropdown(true) }}
                  />

                  {showDropdown && customerSearch && (
                    <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                      {filteredCustomers.map((c) => (
                        <li className="p-2 hover:bg-gray-100 cursor-pointer"
                          key={c.customer_code}
                          onClick={() => {
                            setNewOrder({ ...newOrder, customerId: c.customer_code, customerName: c.customer_name });
                            setCustomerSearch(c.customer_name);
                            setShowDropdown(false); // close dropdown
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
                <Label htmlFor="orderQuantityL">Order Quantity (L)</Label>
                <Input
                  id="orderQuantityL"
                  type="number"
                  value={newOrder.orderQuantityL === 0 ? '' : newOrder.orderQuantityL}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewOrder({
                      ...newOrder,
                      orderQuantityL: val === '' ? 0 : Number(val)
                    });
                  }}
                  placeholder="Enter quantity"
                />
              </div>
              
            </div>

            {/* <div className="grid grid-cols-3 gap-4">
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
            </div> */}

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
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
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
                    <p>Quantity: {order.orderQuantityL}ml</p>
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
