import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, Download, Plus, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PackingGroup {
  packing_size: string;
  no_of_bottles: number;
}

interface ManufacturingOrder {
  product_id: string;
  customer_id: string;
  product_name: string;
  product_description: string;
  order_quantity: number;
  packing_groups: PackingGroup[];
  expected_delivery_date: string;
  category: "Human" | "Veterinary";
  manufacturing_date: string;
  expiry_date: string;
  batch_number: string;
  status: string;
  brand_name: string;
  company_name: string;
  bottles_present: boolean;
  labels_present: boolean;
  order_note: string;
  order_created_at: string;
  manufacturing_code: string;
}

interface CostOrder {
  id: string;
  productName: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  date: string;
}

interface Product {
  external_id: string;
  product_name: string;
  sales_description: string;
  packing_sizes: string[];
}

interface Customer {
  customer_id: string;
  customer_code: string;
  company_name: string;
}

export default function CostConfigurator() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<CostOrder[]>([]);
  const [viewingOrder, setViewingOrder] = useState<CostOrder | null>(null);
  
  const [newManufacturingOrder, setNewManufacturingOrder] = useState<ManufacturingOrder>({
    product_id: "",
    customer_id: "",
    product_name: "",
    product_description: "",
    order_quantity: 0,
    packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
    expected_delivery_date: "",
    category: "Human",
    manufacturing_date: "",
    expiry_date: "",
    batch_number: "",
    status: "Unassigned",
    brand_name: "",
    company_name: "",
    bottles_present: false,
    labels_present: false,
    order_note: "",
    order_created_at: "",
    manufacturing_code: ""
  });

  // Mock data for demo purposes - replace with actual Supabase fetch
  useEffect(() => {
    // Simulated product data
    setProducts([
      { 
        external_id: "P001", 
        product_name: "Enrofloxacin Injection", 
        sales_description: "Antibiotic for veterinary use",
        packing_sizes: ["60ml", "100ml", "250ml", "500ml"]
      },
      { 
        external_id: "P002", 
        product_name: "Paracetamol Syrup", 
        sales_description: "Pain reliever and fever reducer",
        packing_sizes: ["30ml", "60ml", "120ml"]
      },
      { 
        external_id: "P003", 
        product_name: "Vitamin B Complex", 
        sales_description: "Nutritional supplement",
        packing_sizes: ["50ml", "100ml", "200ml"]
      }
    ]);

    // Simulated customer data
    setCustomers([
      { customer_id: "C001", customer_code: "CUST001", company_name: "ABC Pharmaceuticals" },
      { customer_id: "C002", customer_code: "CUST002", company_name: "XYZ Healthcare" },
      { customer_id: "C003", customer_code: "CUST003", company_name: "Global Medics Inc" }
    ]);
  }, []);

  const addPackingGroup = () => {
    setNewManufacturingOrder({
      ...newManufacturingOrder,
      packing_groups: [...newManufacturingOrder.packing_groups, { packing_size: "", no_of_bottles: 0 }],
    });
  };

  const removePackingGroup = (index: number) => {
    if (newManufacturingOrder.packing_groups.length === 1) return;
    const updatedGroups = [...newManufacturingOrder.packing_groups];
    updatedGroups.splice(index, 1);
    setNewManufacturingOrder({ ...newManufacturingOrder, packing_groups: updatedGroups });
  };

  const updatePackingGroup = (index: number, key: keyof PackingGroup, value: string | number) => {
    const updatedGroups = [...newManufacturingOrder.packing_groups];
    updatedGroups[index] = { ...updatedGroups[index], [key]: value };
    setNewManufacturingOrder({ ...newManufacturingOrder, packing_groups: updatedGroups });
  };

  const calculateTotalLiters = (packing_groups: PackingGroup[]) => {
    return packing_groups.reduce((sum, group) => {
      const size = parseFloat(group.packing_size);
      const bottles = Number(group.no_of_bottles);
      
      if (isNaN(size) || isNaN(bottles)) return sum;
      
      return sum + (size * bottles) / 1000;
    }, 0);
  };

  const currentTotalLiters = calculateTotalLiters(newManufacturingOrder.packing_groups);

  const handleAddManufacturingOrder = () => {
    if (!newManufacturingOrder.product_name || !newManufacturingOrder.company_name || !newManufacturingOrder.brand_name) {
      alert('Please fill in all required fields');
      return;
    }

    const newOrder: CostOrder = {
      id: Date.now().toString(),
      productName: newManufacturingOrder.product_name,
      customerName: newManufacturingOrder.company_name,
      quantity: currentTotalLiters,
      unitPrice: 100, // Mock price
      totalCost: currentTotalLiters * 100,
      date: new Date().toISOString()
    };

    setOrders([...orders, newOrder]);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const downloadAsExcel = (order?: CostOrder) => {
    const dataToExport = order ? [order] : orders;
    
    const worksheet = XLSX.utils.json_to_sheet(
      dataToExport.map(o => ({
        'Product Name': o.productName,
        'Customer Name': o.customerName,
        'Quantity (L)': o.quantity,
        'Unit Price': o.unitPrice,
        'Total Cost': o.totalCost,
        'Date': new Date(o.date).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cost Orders');
    
    const fileName = order 
      ? `cost_order_${order.productName}_${Date.now()}.xlsx`
      : `all_cost_orders_${Date.now()}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const selectedProduct = products.find(p => p.external_id === newManufacturingOrder.product_id);
  const filteredPackingSizes = selectedProduct ? selectedProduct.packing_sizes : [];

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.external_id.toLowerCase().includes(productSearch.toLowerCase()) ||
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">Cost Report Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Cost Report
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md border border-green-200">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-green-800">Create Cost Report</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Generic Name *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => { if (productSearch.length > 0) setShowProductDropdown(true); }}
                      placeholder="Enter your Product Details"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {showProductDropdown && productSearch && (
                      <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto shadow-lg rounded-md mt-1">
                        {filteredProducts.map((p) => (
                          <li
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            key={p.external_id}
                            onClick={() => {
                              setNewManufacturingOrder({ 
                                ...newManufacturingOrder, 
                                product_id: p.external_id, 
                                product_name: p.product_name, 
                                product_description: p.sales_description 
                              });
                              setProductSearch(p.product_name);
                              setShowProductDropdown(false);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-700 mr-2">[{p.external_id}]</span>
                            <span className="text-sm">{p.product_name}</span>
                            <span className="text-gray-500 text-xs"> — {p.sales_description}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      placeholder="Enter your Company Details"
                      onFocus={() => { if (customerSearch.length > 0) setShowCustomerDropdown(true); }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {showCustomerDropdown && customerSearch && (
                      <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto shadow-lg rounded-md mt-1">
                        {filteredCustomers.map((c) => (
                          <li
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            key={c.customer_id}
                            onClick={() => {
                              setNewManufacturingOrder({ 
                                ...newManufacturingOrder, 
                                customer_id: c.customer_code, 
                                company_name: c.company_name 
                              });
                              setCustomerSearch(c.company_name);
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <span className="text-sm font-medium text-gray-700 mr-2">[{c.customer_code}]</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                  <input
                    value={newManufacturingOrder.brand_name}
                    onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, brand_name: e.target.value })}
                    placeholder="Enter brand name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Quantity (L)</label>
                  <input
                    type="number"
                    value={currentTotalLiters.toFixed(2)}
                    placeholder="Auto-calculated from packing"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated from: {newManufacturingOrder.packing_groups
                      .filter(group => group.packing_size && group.no_of_bottles > 0)
                      .map((group) => 
                        `${group.packing_size}ml × ${group.no_of_bottles} bottles`
                      ).join(' + ') || 'No packing groups defined'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newManufacturingOrder.category}
                    onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, category: e.target.value as "Human" | "Veterinary" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Human">Human</option>
                    <option value="Veterinary">Veterinary</option>
                  </select>
                </div>              
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Packing Sizes & Number of Bottles *</label>
                {newManufacturingOrder.packing_groups.map((group, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center mb-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={group.packing_size}
                      onChange={e => updatePackingGroup(idx, "packing_size", e.target.value)}
                    >
                      <option value="">Select packing size</option>
                      {filteredPackingSizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      placeholder="No. of bottles"
                      value={group.no_of_bottles === 0 ? "" : group.no_of_bottles}
                      onChange={e => updatePackingGroup(idx, "no_of_bottles", Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                    <button
                      onClick={() => removePackingGroup(idx)}
                      disabled={newManufacturingOrder.packing_groups.length === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addPackingGroup} 
                  className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  + Add packing group
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Notes for This Order</label>
                <textarea
                  placeholder="Add a Remark..."
                  value={newManufacturingOrder.order_note}
                  onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, order_note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[80px]"
                />
              </div> 

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    handleAddManufacturingOrder(); 
                    setNewManufacturingOrder({
                      product_id: "",
                      customer_id: "",
                      product_name: "",
                      product_description: "",
                      order_quantity: 0,
                      packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
                      expected_delivery_date: "",
                      category: "Human",
                      manufacturing_date: "",
                      expiry_date: "",
                      batch_number: "",
                      status: "Unassigned",
                      brand_name: "",
                      company_name: "",
                      bottles_present: false,
                      labels_present: false,
                      order_note: "",
                      order_created_at: "",
                      manufacturing_code: ""
                    });
                    setProductSearch("");
                    setCustomerSearch("");
                  }} 
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create Order
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewManufacturingOrder({
                      product_id: "",
                      customer_id: "",
                      product_name: "",
                      product_description: "",
                      order_quantity: 0,
                      packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
                      expected_delivery_date: "",
                      category: "Human",
                      manufacturing_date: "",
                      expiry_date: "",
                      batch_number: "",
                      status: "Unassigned",
                      brand_name: "",
                      company_name: "",
                      bottles_present: false,
                      labels_present: false,
                      order_note: "",
                      order_created_at: "",
                      manufacturing_code: ""
                    });
                    setProductSearch("");
                    setCustomerSearch("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => downloadAsExcel()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export All to Excel
            </button>
          </div>
        )}

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              No cost orders yet. Add your first order above!
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{order.productName}</h3>
                    <p className="text-gray-600 mt-1">{order.customerName}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Quantity: {order.quantity.toFixed(2)}L | Total: ${order.totalCost.toFixed(2)} | Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => downloadAsExcel(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Product Name:</span>
                  <span className="ml-2 text-gray-600">{viewingOrder.productName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Customer Name:</span>
                  <span className="ml-2 text-gray-600">{viewingOrder.customerName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Quantity:</span>
                  <span className="ml-2 text-gray-600">{viewingOrder.quantity.toFixed(2)} L</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Unit Price:</span>
                  <span className="ml-2 text-gray-600">${viewingOrder.unitPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Total Cost:</span>
                  <span className="ml-2 text-gray-600">${viewingOrder.totalCost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Date:</span>
                  <span className="ml-2 text-gray-600">{new Date(viewingOrder.date).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}