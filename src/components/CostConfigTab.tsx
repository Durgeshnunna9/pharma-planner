import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, Trash2, Download, Plus, Search } from 'lucide-react';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

interface PackingGroup {
  packing_size: string;
  no_of_bottles: number;
}

// Main Order Table
interface CostReportOrder {
  id?: number;
  created_at?: string;
  product_id: number | null;
  customer_id: number | null;
  customer_name: string | null;
  product_name: string | null;
  brand_name: string | null;
}

// Packing Group Details
interface PackingGroupCostReport {
  id?: number;
  created_at?: string;
  packing_size: string | null;
  no_of_bottles: number | null;
  cost_report_id: number;
}

// Cost Breakdown Table
interface CostTableData {
  id?: number;
  created_at?: string;
  cost_report_order_id: number;
  ingridient_name: string | null;
  quantity: number | null;
  rate_per_kg: number | null;
  amount: number | null;
}

// Support Tables
interface ActiveElement {
  id?: number;
  created_at?: string;
  raw_material: string | null;
  raw_material_code: string | null;
  cost_per_kg: number | null;
  product_code: string | null;
  concentration: string | null;
}

interface InactiveElement {
  id?: number;
  created_at?: string;
  raw_material: string | null;
  raw_material_code: number | null;
  cost_per_kg: number | null;
  quantity?: number | null;
}

interface ProductionCost {
  id?: number;
  created_at?: string;
  raw_material: string | null;
  raw_material_code: number | null;
  cost_per_kg: number | null;
  quantity?: number | null;
}

interface PackagingElement {
  id?: number;
  created_at?: string;
  raw_material: string | null;
  raw_material_code: number | null;
  cost_per_kg: number | null;
  quantity?: number | null;
}

interface BottleSize {
  id?: number;
  size_label: string;
  unit: string;
  rate: number;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
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

// For display in orders list
interface CostOrderDisplay {
  id: string;
  product_name: string;
  customer_name: string;
  brand_name: string;
  quantity: number;
  total_cost: number;
  date: string;
  cost_items?: CostTableData[];
}

// ============================================
// CALCULATION HELPER FUNCTIONS
// ============================================

function calculateTotalLiters(packingGroups: PackingGroup[]): number {
  return packingGroups.reduce((totalLiters, group) => {
    const sizeInML = parseFloat(group.packing_size.replace(/[^0-9.]/g, ''));
    const bottles = Number(group.no_of_bottles);
    
    if (isNaN(sizeInML) || isNaN(bottles) || bottles <= 0) {
      return totalLiters;
    }
    
    const litersForThisGroup = (sizeInML * bottles) / 1000;
    return totalLiters + litersForThisGroup;
  }, 0);
}

function parseConcentration(concentrationString: string): number {
  if (!concentrationString) return 0;

  const str = concentrationString.toLowerCase().trim();

  const mgPerMlMatch = str.match(/(\d+\.?\d*)mg\/(\d+\.?\d*)ml/);
  if (mgPerMlMatch) {
    const mg = parseFloat(mgPerMlMatch[1]);
    const ml = parseFloat(mgPerMlMatch[2]);
    return mg / ml;
  }

  const percentMatch = str.match(/(\d+\.?\d*)%/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]);
  }

  const numberMatch = str.match(/^(\d+\.?\d*)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  return 0;
}

interface GenerateCostTableDataParams {
  costReportOrderId: number;
  totalLiters: number;
  productCode: string;
  packingGroups: PackingGroup[];
  activeElements: ActiveElement[];
  inactiveElements: InactiveElement[];
  productionCosts: ProductionCost[];
  packagingElements: PackagingElement[];
  bottleSizes: BottleSize[];
}

function generateCostTableData(params: GenerateCostTableDataParams): CostTableData[] {
  const {
    costReportOrderId,
    totalLiters,
    productCode,
    packingGroups,
    activeElements,
    inactiveElements,
    productionCosts,
    packagingElements,
    bottleSizes
  } = params;

  const costTableEntries: CostTableData[] = [];

  // A. ACTIVE ELEMENTS
  const productActiveElements = activeElements.filter(
    ae => ae.product_code === productCode
  );

  productActiveElements.forEach(activeElement => {
    if (!activeElement.raw_material || !activeElement.concentration) {
      return;
    }

    const concentrationValue = parseConcentration(activeElement.concentration);
    
    if (concentrationValue === 0) {
      return;
    }

    const quantityInKg = (concentrationValue * totalLiters) / 1000;
    const ratePerKg = activeElement.cost_per_kg || 0;
    const amount = quantityInKg * ratePerKg;

    costTableEntries.push({
      cost_report_order_id: costReportOrderId,
      ingridient_name: activeElement.raw_material,
      quantity: Math.round(quantityInKg * 100) / 100,
      rate_per_kg: ratePerKg,
      amount: Math.round(amount * 100) / 100
    });
  });

  // B. INACTIVE ELEMENTS
  inactiveElements.forEach(inactiveElement => {
    if (!inactiveElement.raw_material) {
      return;
    }

    const quantityInKg = inactiveElement.quantity || 50;
    const ratePerKg = inactiveElement.cost_per_kg || 0;
    const amount = quantityInKg * ratePerKg;

    costTableEntries.push({
      cost_report_order_id: costReportOrderId,
      ingridient_name: inactiveElement.raw_material,
      quantity: quantityInKg,
      rate_per_kg: ratePerKg,
      amount: Math.round(amount * 100) / 100
    });
  });

  // C. PRODUCTION COSTS
  productionCosts.forEach(prodCost => {
    if (!prodCost.raw_material) {
      return;
    }

    const quantityInKg = prodCost.quantity || 500;
    const ratePerKg = prodCost.cost_per_kg || 0;
    const amount = quantityInKg * ratePerKg;

    costTableEntries.push({
      cost_report_order_id: costReportOrderId,
      ingridient_name: prodCost.raw_material,
      quantity: quantityInKg,
      rate_per_kg: ratePerKg,
      amount: Math.round(amount * 100) / 100
    });
  });

  // D. PACKAGING ELEMENTS
  packagingElements.forEach(packagingElem => {
    if (!packagingElem.raw_material) {
      return;
    }

    const quantityInKg = packagingElem.quantity || 2;
    const ratePerKg = packagingElem.cost_per_kg || 0;
    const amount = quantityInKg * ratePerKg;

    costTableEntries.push({
      cost_report_order_id: costReportOrderId,
      ingridient_name: packagingElem.raw_material,
      quantity: quantityInKg,
      rate_per_kg: ratePerKg,
      amount: Math.round(amount * 100) / 100
    });
  });

  // E. BOTTLES
  const bottleGrouping: { [size: string]: number } = {};
  
  packingGroups.forEach(group => {
    const size = group.packing_size;
    const bottles = group.no_of_bottles;
    
    if (bottleGrouping[size]) {
      bottleGrouping[size] += bottles;
    } else {
      bottleGrouping[size] = bottles;
    }
  });

  Object.entries(bottleGrouping).forEach(([size, totalBottles]) => {
    const bottleInfo = bottleSizes.find(
      bs => bs.size_label.toLowerCase() === size.toLowerCase() ||
            bs.size_label === `${size}ml` ||
            bs.size_label === size.replace(/ml/i, '') + 'ml'
    );

    if (!bottleInfo) {
      console.warn(`Bottle size "${size}" not found in bottle_sizes table`);
      return;
    }

    const quantity = totalBottles;
    const rate = bottleInfo.rate;
    const amount = quantity * rate;

    costTableEntries.push({
      cost_report_order_id: costReportOrderId,
      ingridient_name: `${size} BOTLS`,
      quantity: quantity,
      rate_per_kg: rate,
      amount: Math.round(amount * 100) / 100
    });
  });

  return costTableEntries;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CostConfigurator() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  // Reference Data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeElements, setActiveElements] = useState<ActiveElement[]>([]);
  const [inactiveElements, setInactiveElements] = useState<InactiveElement[]>([]);
  const [productionCosts, setProductionCosts] = useState<ProductionCost[]>([]);
  const [packagingElements, setPackagingElements] = useState<PackagingElement[]>([]);
  const [bottleSizes, setBottleSizes] = useState<BottleSize[]>([]);
  
  // Orders
  const [orders, setOrders] = useState<CostOrderDisplay[]>([]);
  const [viewingOrder, setViewingOrder] = useState<CostOrderDisplay | null>(null);
  
  const [newCostReportOrder, setNewCostReportOrder] = useState<{
    product_id: string;
    customer_id: string;
    product_name: string;
    customer_name: string;
    brand_name: string;
    packing_groups: PackingGroup[];
  }>({
    product_id: "",
    customer_id: "",
    product_name: "",
    customer_name: "",
    brand_name: "",
    packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
  });

  // ============================================
  // MOCK DATA - Replace with Supabase fetch
  // ============================================
  useEffect(() => {
    // TODO: Replace with actual Supabase fetch
    // fetchProducts();
    // fetchCustomers();
    // fetchActiveElements();
    // fetchInactiveElements();
    // fetchProductionCosts();
    // fetchPackagingElements();
    // fetchBottleSizes();
    
    // Mock data for testing
    setProducts([
      { external_id: "P001", product_name: "UNIFLOX-BH SOLUTION", sales_description: "Antibiotic Solution", packing_sizes: ["100", "250", "500", "1000"] }
    ]);
    
    setCustomers([
      { customer_id: "C001", customer_code: "CUST001", company_name: "ABC Pharma Ltd" }
    ]);
    
    setActiveElements([
      { raw_material: "ENROFLOXACIN - 200mg/ml", raw_material_code: "RM001", cost_per_kg: 2301, product_code: "P001", concentration: "200mg/ml" },
      { raw_material: "BROMOHEXINE HCL - 15mg/ml", raw_material_code: "RM002", cost_per_kg: 2183, product_code: "P001", concentration: "15mg/ml" }
    ]);
    
    setInactiveElements([
      { raw_material: "ACETIC ACID", raw_material_code: 3, cost_per_kg: 173, quantity: 50 },
      { raw_material: "FLAVOUR ME", raw_material_code: 4, cost_per_kg: 960, quantity: 15 }
    ]);
    
    setProductionCosts([
      { raw_material: "Overheads Charges", raw_material_code: 10, cost_per_kg: 25, quantity: 500 }
    ]);
    
    setPackagingElements([
      { raw_material: "Bopp Tape", raw_material_code: 13, cost_per_kg: 90, quantity: 2 }
    ]);
    
    setBottleSizes([
      { size_label: "100ml", unit: "ml", rate: 0, notes: null },
      { size_label: "250ml", unit: "ml", rate: 0, notes: null },
      { size_label: "500ml", unit: "ml", rate: 0, notes: null },
      { size_label: "1000ml", unit: "ml", rate: 0, notes: null }
    ]);
  }, []);

  // ============================================
  // PACKING GROUP HANDLERS
  // ============================================

  const addPackingGroup = () => {
    setNewCostReportOrder({
      ...newCostReportOrder,
      packing_groups: [...newCostReportOrder.packing_groups, { packing_size: "", no_of_bottles: 0 }],
    });
  };

  const removePackingGroup = (index: number) => {
    if (newCostReportOrder.packing_groups.length === 1) return;
    const updatedGroups = [...newCostReportOrder.packing_groups];
    updatedGroups.splice(index, 1);
    setNewCostReportOrder({ ...newCostReportOrder, packing_groups: updatedGroups });
  };

  const updatePackingGroup = (index: number, key: keyof PackingGroup, value: string | number) => {
    const updatedGroups = [...newCostReportOrder.packing_groups];
    updatedGroups[index] = { ...updatedGroups[index], [key]: value };
    setNewCostReportOrder({ ...newCostReportOrder, packing_groups: updatedGroups });
  };

  const currentTotalLiters = calculateTotalLiters(newCostReportOrder.packing_groups);

  // ============================================
  // CREATE COST REPORT ORDER
  // ============================================

  const handleAddCostReportOrder = async () => {
    if (!newCostReportOrder.product_name || !newCostReportOrder.customer_name || !newCostReportOrder.brand_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Replace with Supabase insert
      // 1. Insert into cost_report_order
      const mockOrderId = Date.now();
      
      // 2. Insert into packing_group_costreport
      // await supabase.from('packing_group_costreport').insert(...)
      
      // 3. Generate cost_table_data
      const costTableData = generateCostTableData({
        costReportOrderId: mockOrderId,
        totalLiters: currentTotalLiters,
        productCode: newCostReportOrder.product_id,
        packingGroups: newCostReportOrder.packing_groups,
        activeElements,
        inactiveElements,
        productionCosts,
        packagingElements,
        bottleSizes
      });
      
      // 4. Insert cost_table_data
      // await supabase.from('cost_table_data').insert(costTableData);
      
      // Calculate total cost
      const totalCost = costTableData.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // 5. Add to display list
      const newOrder: CostOrderDisplay = {
        id: mockOrderId.toString(),
        product_name: newCostReportOrder.product_name,
        customer_name: newCostReportOrder.customer_name,
        brand_name: newCostReportOrder.brand_name,
        quantity: currentTotalLiters,
        total_cost: totalCost,
        date: new Date().toISOString(),
        cost_items: costTableData
      };

      setOrders([...orders, newOrder]);
      setShowAddForm(false);
      
      // Reset form
      setNewCostReportOrder({
        product_id: "",
        customer_id: "",
        product_name: "",
        customer_name: "",
        brand_name: "",
        packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
      });
      setProductSearch("");
      setCustomerSearch("");
      
      alert('Cost report created successfully!');
    } catch (error) {
      console.error('Error creating cost report:', error);
      alert('Error creating cost report. Check console for details.');
    }
  };

  // ============================================
  // DELETE ORDER
  // ============================================

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      // TODO: Delete from Supabase
      // await supabase.from('cost_report_order').delete().eq('id', id);
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  // ============================================
  // FILTERED DATA
  // ============================================

  const selectedProduct = products.find(p => p.external_id === newCostReportOrder.product_id);
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

  // ============================================
  // RENDER
  // ============================================

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
                              setNewCostReportOrder({ 
                                ...newCostReportOrder, 
                                product_id: p.external_id, 
                                product_name: p.product_name
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
                              setNewCostReportOrder({ 
                                ...newCostReportOrder, 
                                customer_id: c.customer_code, 
                                customer_name: c.company_name 
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

              <div className="grid grid-cols-2 gap-4">              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                  <input
                    value={newCostReportOrder.brand_name}
                    onChange={(e) => setNewCostReportOrder({ ...newCostReportOrder, brand_name: e.target.value })}
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
                    Calculated from: {newCostReportOrder.packing_groups
                      .filter(group => group.packing_size && group.no_of_bottles > 0)
                      .map((group) => 
                        `${group.packing_size}ml × ${group.no_of_bottles} bottles`
                      ).join(' + ') || 'No packing groups defined'}
                  </p>
                </div>             
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Packing Sizes & Number of Bottles *</label>
                {newCostReportOrder.packing_groups.map((group, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 items-center mb-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={group.packing_size}
                      onChange={e => updatePackingGroup(idx, "packing_size", e.target.value)}
                    >
                      <option value="">Select packing size</option>
                      {filteredPackingSizes.map((size) => (
                        <option key={size} value={size}>{size}ml</option>
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
                      disabled={newCostReportOrder.packing_groups.length === 1}
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

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleAddCostReportOrder} 
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create Order
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCostReportOrder({
                      product_id: "",
                      customer_id: "",
                      product_name: "",
                      customer_name: "",
                      brand_name: "",
                      packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
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
                    <h3 className="text-xl font-semibold text-gray-800">{order.product_name}</h3>
                    <p className="text-gray-600 mt-1">{order.customer_name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Brand: {order.brand_name} | Quantity: {order.quantity.toFixed(2)}L | Total: ₹{order.total_cost.toFixed(2)} | Date: {new Date(order.date).toLocaleDateString()}
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
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Cost Breakdown Details</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="font-semibold text-gray-700">Product Name:</span>
                    <span className="ml-2 text-gray-600">{viewingOrder.product_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Customer Name:</span>
                    <span className="ml-2 text-gray-600">{viewingOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Brand Name:</span>
                    <span className="ml-2 text-gray-600">{viewingOrder.brand_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Quantity:</span>
                    <span className="ml-2 text-gray-600">{viewingOrder.quantity.toFixed(2)} L</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total Cost:</span>
                    <span className="ml-2 text-gray-600 font-bold text-green-600">₹{viewingOrder.total_cost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-600">{new Date(viewingOrder.date).toLocaleString()}</span>
                  </div>
                </div>

                {viewingOrder.cost_items && viewingOrder.cost_items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Cost Items Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">S.NO</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Ingredient Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Quantity</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Rate/KG</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingOrder.cost_items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 text-sm">{idx + 1}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{item.ingridient_name}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right">{item.quantity?.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right">{item.rate_per_kg?.toFixed(2)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold">{item.amount?.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="bg-green-50 font-bold">
                            <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right">TOTAL PAYABLE AMOUNT</td>
                            <td className="border border-gray-300 px-4 py-2 text-right text-green-700">₹{viewingOrder.total_cost.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end">
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