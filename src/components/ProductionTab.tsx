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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


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
  product_description: string;
  company_name?: string | null;
  batch_number: string | null; // null if unassigned
  expected_delivery_date: string;
  manufacturing_date: string;
  expiry_date: string;
  packing_groups: PackingGroup[]; // multiple groups now
  status: "Unassigned" | "InQueue" | "Under Production" | "Filling" | "Labelling" | "Packing" | "Ready to Dispatch" | "Dispatched";
  bottles_present: boolean;
  labels_present: boolean;
  order_note: string;
  manufacturing_code: string;
  order_created_at: string;
  uqc:string;
}

const ProductionTab = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [manufacturingOrderSearch, setManufacturingOrderSearch] = useState("");
  const [selectedManufacturingOrder, setSelectedManufacturingOrder] = useState<ManufacturingOrder | null>(null);
  const [showManufacturingOrderDetails, setShowManufacturingOrderDetails] = useState(false);
  const [batchInfo, setBatchInfo] = useState<{
    lastBatch: string | null;
    nextBatch: string | null;
    prefix: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [newManufacturingOrder, setNewManufacturingOrder] = useState<Omit<ManufacturingOrder, "order_id" >>({
    product_id: "",
    customer_id: "",
    product_name: "",
    brand_name: "",
    company_name: "",
    product_description: "",
    order_quantity: 0,
    packing_groups: [{ packing_size: "", no_of_bottles: 0 }], // start with one group
    expected_delivery_date: "",
    category: "Human" as "Human" | "Veterinary",
    manufacturing_date: "",
    expiry_date: "",
    batch_number: "",
    status: "Unassigned",
    bottles_present: false,
    labels_present: false,
    order_note: "",
    manufacturing_code: "",
    order_created_at: "",
    uqc: "",

    
  });
  const [filterCategory, setFilterCategory] = useState<"All" | "Human" | "Veterinary">("All");
  const [assignmentFilter, setAssignmentFilter] = useState<"All" | "Assigned" | "Unassigned">("Unassigned");
  const [productionCompletionFilter, setProductionCompletionFilter] = useState<"All" | "Completed" | "Incomplete">("Incomplete");
  // For product and customer search
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState(false);
  // const [batchAssigned, setBatchAssigned] = useState(false);
  const [batchAssignedMap, setBatchAssignedMap] = useState<{ [orderId: string]: boolean }>({});
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
  const [previousBatchNumber, setPreviousBatchNumber] = useState<string | null>(null);
  // type ManufacturingOrderEditable = Omit<ManufacturingOrder,  "product_id" | "customer_id">;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    order_id:'',
    product_name: '',
    product_description: '',
    order_quantity: 0,
    category: 'Human' as 'Human' | 'Veterinary',
    brand_name: '',
    company_name: '',
    packing_groups: [
      { packing_size: "", no_of_bottles: 0}
    ],
    batch_number: "" ,
    status: "Unassigned",
    bottles_present: false,
    labels_present: false,
    order_note: "",
    uqc: ""
    
  });

  const formatMonthYear = (value: string | Date | null) => {
    if (!value) return "";
  
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "";
  
    return d.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  const formatPackingGroups = (groups) => {
    if (!Array.isArray(groups)) return [];
  
    return groups.map(g => ({
      [g.packing_size]: g.no_of_bottles
    }));
  };

  const handleExport = () => {
    try {
      if (!filteredManufacturingOrders || filteredManufacturingOrders.length === 0) {
        alert("No records to export");
        return;
      }
  
      // Convert manufacturing orders into a clean Excel-ready structure
      const exportData = filteredManufacturingOrders.map(order => ({
        ManufacturingCode: order.manufacturing_code || "",
        Product_Name: order.product_name,        
        Description: order.product_description,
        Company_Name: order.company_name,
        Brand_Name: order.brand_name,
        Category: order.category,
        Batch_Number: order.batch_number,
        Status: order.status,
        Order_Qty: `${order.order_quantity} ${order.uqc === "BTL" ? "L" : "Kg"}`,
        UQC: order.uqc,
        PackingGroups: JSON.stringify(formatPackingGroups(order.packing_groups)),
        Bottles_Present: order.bottles_present ? "Yes" : "No",
        Labels_Present: order.labels_present ? "Yes" : "No",
        Manufacturing_Date: formatMonthYear(order.manufacturing_date),
        Expiry_Date: formatMonthYear(order.expiry_date),
        CreatedAt: order.order_created_at,
      }));
  
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
  
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Manufacturing Orders");
  
      // Convert workbook to binary
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
  
      // Trigger file download
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
  
      saveAs(blob, `manufacturing_orders_${Date.now()}.xlsx`);
    } catch (err) {
      console.error("Export error:", err);
    }
  };
  

  // =============================================
  // 2️⃣ FETCH BATCH INFO - FIXED
  // =============================================

  const fetchBatchInfo = async (category: "Human" | "Veterinary") => {
    try {
      // ✅ Use separate tables for each category
      const tableName = category === "Human" ? "human_batch_counter" : "veterinary_batch_counter";
      
      const { data, error } = await supabase
        .from(tableName)
        .select("last_batch_number")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      const defaultPrefix = category === "Human" ? "SFH25" : "SFV25";

      if (error) {
        console.warn("⚠️ No batch counter found:", error);
        setBatchInfo({
          lastBatch: null,
          nextBatch: `${defaultPrefix}001`,
          prefix: defaultPrefix,
        });
        return;
      }

      const lastBatch = data?.last_batch_number || null;

      // Calculate next suggested batch
      const nextBatch = lastBatch ? getNextBatchNumber(lastBatch) : `${defaultPrefix}001`;

      setBatchInfo({
        lastBatch,
        nextBatch,
        prefix: defaultPrefix,
      });

      console.log("✅ Batch info loaded:", { lastBatch, nextBatch, prefix: defaultPrefix });
    } catch (err) {
      console.error("Error fetching batch info:", err);
      setBatchInfo(null);
    }
  };

  const getNextBatchNumber = (lastBatch: string): string => {
    console.log("🔍 Calculating next batch from:", lastBatch);

    // Parse: SFH25045A -> prefix=SFH25, num=045, suffix=A
    const match = lastBatch.match(/^([A-Z]+\d{2})(\d+)([A-Z]?)$/);
    
    if (!match) {
      console.warn("❌ Could not parse batch:", lastBatch);
      return lastBatch; // Fallback
    }

    const [, prefix, numPart, suffix] = match;
    const num = parseInt(numPart, 10);
    const padLen = numPart.length;
    const padded = (n: number) => String(n).padStart(padLen, "0");

    console.log("🧩 Parsed:", { prefix, num, suffix, padLen });

    let nextBatch = "";

    if (!suffix) {
      // No suffix: SFH25045 -> SFH25046
      nextBatch = `${prefix}${padded(num + 1)}`;
      console.log("🔢 Numeric increment:", nextBatch);
    } else if (/^[A-Z]$/.test(suffix)) {
      // Alphabetic suffix: SFH25045A -> SFH25045B
      if (suffix === "Z") {
        // Rollover: SFH25045Z -> SFH25046
        nextBatch = `${prefix}${padded(num + 1)}`;
        console.log("🔁 Rollover after Z:", nextBatch);
      } else {
        // Increment letter: A->B, B->C, etc.
        const nextChar = String.fromCharCode(suffix.charCodeAt(0) + 1);
        nextBatch = `${prefix}${padded(num)}${nextChar}`;
        console.log("🔠 Letter increment:", nextBatch);
      }
    } else {
      console.warn("⚠️ Unknown suffix pattern, using numeric increment");
      nextBatch = `${prefix}${padded(num + 1)}`;
    }

    console.log("✅ Next batch:", nextBatch);
    return nextBatch;
  };

  // =============================================
  // 4️⃣ UPDATE BATCH COUNTER - FIXED (Separate Tables)
  // =============================================

  const updateBatchCounter = async (
    category: "Human" | "Veterinary",
    lastBatch: string
  ) => {
    console.log("📝 Updating batch counter:", { category, lastBatch });

    try {
      // Parse to extract numeric part
      const match = lastBatch.match(/^([A-Z]+\d{2})(\d+)([A-Z]?)$/);
      
      if (!match) {
        console.warn("⚠️ Could not parse batch for counter update:", lastBatch);
        return;
      }

      const [, prefix, numPart] = match;
      const lastNumber = parseInt(numPart, 10);

      // ✅ Use separate tables
      const tableName = category === "Human" ? "human_batch_counter" : "veterinary_batch_counter";

      // Update or insert counter
      const { error } = await supabase
        .from(tableName)
        .upsert(
          {
            last_batch_number: lastBatch,
            last_number: lastNumber,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id", // Adjust based on your table's primary key
          }
        );

      if (error) throw error;
      console.log("✅ Counter updated:", { lastNumber, lastBatch });
    } catch (err) {
      console.error("💥 Failed to update batch counter:", err);
    }
  };

  // =============================================
  // 5️⃣ PROCESS BATCH NUMBER - FIXED
  // =============================================

  const processBatchNumber = async (order: {
    order_id: string;
    batch_number: string;
    category: "Human" | "Veterinary";
  }): Promise<{ success: boolean; createdCount: number; batches: string[] }> => {
    console.log("🟢 processBatchNumber() called:", order);

    try {
      const { order_id, batch_number, category } = order;

      if (!batch_number?.trim()) {
        throw new Error("Batch number is required.");
      }

      const input = batch_number.toUpperCase().trim();
      const yearSuffix = new Date().getFullYear().toString().slice(-2);
      const autoPrefix = category === "Human" ? `SFH${yearSuffix}` : `SFV${yearSuffix}`;

      let working = input;
      let usedPrefix = autoPrefix;

      // Detect existing prefix (e.g., SFH25)
      const prefixMatch = working.match(/^(SFH|SFV)\d{2}/);
      if (prefixMatch) {
        usedPrefix = working.slice(0, 5);
        working = working.slice(5);
        console.log(`ℹ️ Using prefix "${usedPrefix}", remaining: "${working}"`);
      } else {
        console.log(`ℹ️ Auto-prefix "${usedPrefix}"`);
      }

      let batches: string[] = [];

      // --- Case 1: Single batch (numeric or with suffix) ---
      if (!working.includes("-")) {
        batches = [`${usedPrefix}${working}`];
        console.log("📦 Single batch:", batches[0]);
      }
      // --- Case 2: Range ---
      else {
        console.log("📊 Range detected:", working);
        const [startRaw, endRaw] = working.split("-");
        
        // Parse start and end (e.g., "045A" or "110")
        const startMatch = startRaw.match(/^(\d+)([A-Z]?)$/);
        const endMatch = endRaw.match(/^(\d+)([A-Z]?)$/);

        if (!startMatch || !endMatch) {
          throw new Error("Invalid range format (e.g., 007-009 or 045A-047A)");
        }

        const startNum = parseInt(startMatch[1], 10);
        const endNum = parseInt(endMatch[1], 10);
        const suffixStart = startMatch[2] || "";
        const suffixEnd = endMatch[2] || "";

        // Both must have same suffix type
        if (suffixStart !== suffixEnd) {
          throw new Error("Range suffixes must match (e.g., 045A-047A)");
        }

        if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
          throw new Error("Invalid numeric range");
        }

        const padLen = Math.max(startMatch[1].length, endMatch[1].length, 3);
        console.log(`➡️ Range ${startNum}-${endNum}, suffix: "${suffixStart}"`);

        // Generate batches
        for (let i = startNum; i <= endNum; i++) {
          const batch = `${usedPrefix}${String(i).padStart(padLen, "0")}${suffixStart}`;
          batches.push(batch);
        }

        console.log("📦 Generated batches:", batches);
      }

      // --- Fetch base order ---
      const { data: baseOrder, error: fetchError } = await supabase
        .from("manufacturing_orders")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (fetchError || !baseOrder) {
        throw new Error("Order not found");
      }

      // --- Update first batch ---
      console.log("📝 Updating order with batch:", batches[0]);
      const { error: updateError } = await supabase
        .from("manufacturing_orders")
        .update({ batch_number: batches[0] })
        .eq("order_id", order_id);

      if (updateError) throw updateError;

      // --- Insert remaining batches ---
      if (batches.length > 1) {
        console.log(`🧩 Creating ${batches.length - 1} duplicate orders...`);
        
        const newOrders = batches.slice(1).map(batch => {
          const { order_id: _, created_at, updated_at, order_created_at, ...rest } = baseOrder;
          return {
            ...rest,
            batch_number: batch,
            order_created_at: new Date().toISOString(),
          };
        });

        const { error: insertError } = await supabase
          .from("manufacturing_orders")
          .insert(newOrders);

        if (insertError) throw insertError;
        console.log(`✅ ${newOrders.length} batches created`);
      }

      // --- Update batch counter ---
      const lastBatch = batches[batches.length - 1];
      await updateBatchCounter(category, lastBatch);

      console.log("🎉 Processing complete!");
      return {
        success: true,
        createdCount: batches.length,
        batches,
      };
    } catch (err: any) {
      console.error("💥 Error in processBatchNumber:", err);
      throw err;
    }
  };

  // =============================================
  // 6️⃣ SAVE ORDER - COMPLETE
  // =============================================

  const handleSaveOrder = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);

      if (!editForm.product_name || !editForm.company_name) {
        toast({ 
          title: 'Error', 
          description: 'Please fill in all required fields.' 
        });
        return;
      }

      const batchNumber = editForm.batch_number?.trim();
      const updateData: any = {
        product_name: editForm.product_name,
        company_name: editForm.company_name,
        brand_name: editForm.brand_name,
        category: editForm.category,
        order_quantity: editForm.order_quantity,
        expected_delivery_date: selectedManufacturingOrder.expected_delivery_date,
        manufacturing_date: selectedManufacturingOrder.manufacturing_date,
        expiry_date: selectedManufacturingOrder.expiry_date,
        bottles_present: editForm.bottles_present,
        labels_present: editForm.labels_present,
        order_note: editForm.order_note,
        product_description: editForm.product_description,
        uqc: editForm.uqc,
        status: selectedManufacturingOrder.status === "Unassigned" && batchNumber
          ? "InQueue"
          : selectedManufacturingOrder.status,
      };

      // Only include batch_number if NOT a range
      if (batchNumber && !batchNumber.slice(5).includes("-")) {
        updateData.batch_number = batchNumber;
      }

      const { error: orderError } = await supabase
        .from("manufacturing_orders")
        .update(updateData)
        .eq("order_id", selectedManufacturingOrder.order_id);

      if (orderError) {
        toast({ title: 'Error', description: 'Failed to update order.' });
        return;
      }

      let result = { success: true, createdCount: 0, batches: [] };
      if (batchNumber) {
        result = await processBatchNumber({
          order_id: selectedManufacturingOrder.order_id,
          batch_number: batchNumber,
          category: editForm.category,
        });
      }

      // Update packing groups
      await supabase
        .from('packing_groups')
        .delete()
        .eq('manufacturing_order_id', selectedManufacturingOrder.order_id);

      const rows = (editForm.packing_groups || [])
        .filter(g => g.packing_size && g.no_of_bottles > 0)
        .map(g => ({
          manufacturing_order_id: selectedManufacturingOrder.order_id,
          packing_size: g.packing_size,
          no_of_bottles: g.no_of_bottles,
        }));

      if (rows.length) {
        await supabase.from('packing_groups').insert(rows);
      }

      // Refresh order
      const { data: refreshedData } = await supabase
        .from("manufacturing_orders_with_packing")
        .select("*")
        .eq("order_id", selectedManufacturingOrder.order_id)
        .single();

      if (refreshedData) {
        const refreshedOrder = {
          ...refreshedData,
          bottles_present: Boolean(refreshedData.bottles_present),
          labels_present: Boolean(refreshedData.labels_present),
        };

        setManufacturingOrders(prev =>
          prev.map(o => o.order_id === refreshedOrder.order_id ? refreshedOrder : o)
        );
        setSelectedManufacturingOrder(refreshedOrder);
      }

      await fetchBatchInfo(editForm.category);
      setIsEditing(false);

      if (result.batches && result.batches.length > 1) {
        toast({
          title: 'Success',
          description: `Created ${result.createdCount} batches: ${result.batches.join(", ")}`,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Order updated successfully.',
        });
      }
    } catch (err) {
      console.error("Error saving order:", err);
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : "Unknown error" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // =============================================
  // 7️⃣ USE EFFECT
  // =============================================

  useEffect(() => {
    if (isEditing && editForm.category) {
      fetchBatchInfo(editForm.category);
    }
  }, [isEditing, editForm.category]);

  useEffect(() => {
    if (isEditing && editForm.category) {
      fetchBatchInfo(editForm.category);
    }
  }, [isEditing, editForm.category]);  

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase.from("product_with_sizes").select("*");
      const { data: customerData } = await supabase.from("customer").select("*");
      setProducts(productData || []);
      setCustomers(customerData || []);
    };
  
    const loadManufacturingOrders = async () => {
      const { data, error } = await supabase
        .from("manufacturing_orders_with_packing")
        .select("*");
    
      if (error) {
        console.error("Failed to load orders", error);
        return;
      }
    
      // 🔽 Sort by creation date (newest first)
      const sorted = [...data].sort((a, b) => {
        return new Date(b.order_created_at).getTime() - new Date(a.order_created_at).getTime();
      });
    
      const transformed = sorted.map(order => ({
        ...order,
        status: order.status || "Unassigned",
        bottles_present: Boolean(order.bottles_present),
        labels_present: Boolean(order.labels_present),
      }));
    
      const batchMap = {};
      transformed.forEach(order => {
        batchMap[order.order_id] = !!order.batch_number;
      });
    
      setManufacturingOrders(transformed);
      setBatchAssignedMap(batchMap);
    };    
  
    loadManufacturingOrders();
    fetchData();
  }, []);

  // Product selected for packing sizes
  const selectedProduct = products.find(p => p.external_id === newManufacturingOrder.product_id);
  const filteredPackingSizes = selectedProduct ? selectedProduct.packing_sizes : [];

  // Filter products and customers by search term
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes((productSearch || editForm?.product_name).toLowerCase()) ||
    p.external_id.toString().includes((productSearch || editForm?.product_name).toLowerCase()) ||
    p.sales_description.toLowerCase().includes((productSearch || editForm?.product_name).toLowerCase())
  );

  const filteredCustomers = customers.filter((c) => {
  const name = (c.company_name || "").toLowerCase();
  const code = (c.customer_code || "").toString().toLowerCase();
  const search = customerSearch.toLowerCase();

  return name.includes(search) || code.includes(search);
  });

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

  //========================== Packing Group=============================

  // Update function (generalized)
  const updatePackingGroupValue = (
    groups: PackingGroup[],
    setGroups: React.Dispatch<React.SetStateAction<any>>,
    index: number,
    field: "packing_size" | "no_of_bottles",
    value: any
  ) => {
    const updated = [...groups];
    updated[index] = { ...updated[index], [field]: value };
    setGroups((prev: any) => ({ ...prev, packing_groups: updated }));
  };

  // Add function (generalized)
  const addPackingGroupValue = (groups: PackingGroup[], setGroups: React.Dispatch<React.SetStateAction<any>>) => {
    setGroups((prev: any) => ({
      ...prev,
      packing_groups: [...groups, { packing_size: "", no_of_bottles: 0 }]
    }));
  };

  // Remove function (generalized)
  const removePackingGroupValue = (
    groups: PackingGroup[],
    setGroups: React.Dispatch<React.SetStateAction<any>>,
    index: number
  ) => {
    if (groups.length === 1) return;
    const updated = groups.filter((_, i) => i !== index);
    setGroups((prev: any) => ({
      ...prev,
      packing_groups: updated.length ? updated : [{ packing_size: "", no_of_bottles: 0 }]
    }));
  };

  // Row calculation
  const calculateRowLiters = (size: string, bottles: number) => {
    if (!size || bottles <= 0) return 0;
    return (parseFloat(size) * bottles) / 1000;
  };

  // Total liters calculation
  const calculateTotalLiters = (groups: PackingGroup[]) => {
    if (!groups || groups.length === 0) return 0;

    return groups.reduce((sum, group) => {
      const size = parseFloat(group.packing_size);
      const bottles = group.no_of_bottles;

      if (isNaN(size) || bottles <= 0) return sum;

      return sum + (size * bottles) / 1000;
    }, 0);
  };

  //=============================================================

  const handleAddManufacturingOrder = async () => {
    // --------------------------
    // 1️⃣ Required Field Validation
    // --------------------------
    if (
      !newManufacturingOrder.product_name ||
      !newManufacturingOrder.brand_name ||
      !newManufacturingOrder.company_name ||
      !newManufacturingOrder.order_quantity
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  
    // --------------------------
    // 2️⃣ Validate Packing Groups
    // --------------------------
    for (const group of newManufacturingOrder.packing_groups) {
      const isEmptyRow =
        (!group.packing_size || group.packing_size.trim() === "") &&
        (!group.no_of_bottles || Number(group.no_of_bottles) <= 0);
  
      if (isEmptyRow) continue;
  
      if (!group.packing_size || Number(group.no_of_bottles) <= 0) {
        toast({
          title: "Error",
          description: "Please fill all packing size and bottles fields correctly.",
          variant: "destructive",
        });
        return;
      }
    }
  
    // --------------------------
    // 3️⃣ Generate Manufacturing Code
    // --------------------------
    const { data: codeData, error: codeError } = await supabase.rpc(
      "generate_manufacturing_code"
    );
  
    if (codeError) {
      console.error(codeError);
      toast({
        title: "Error",
        description: "Failed to generate manufacturing code",
      });
      return;
    }
  
    const manufacturingCode = codeData;
  
    // --------------------------
    // 4️⃣ Insert Manufacturing Order
    // --------------------------
    const { data: manufacturingOrderData, error: manufacturingOrderError } =
      await supabase
        .from("manufacturing_orders")
        .insert([
          {
            manufacturing_code: manufacturingCode,
            product_id: newManufacturingOrder.product_id,
            customer_id: newManufacturingOrder.customer_id,
            product_name: newManufacturingOrder.product_name,
            product_description: newManufacturingOrder.product_description,
            order_quantity: newManufacturingOrder.order_quantity,
            category: newManufacturingOrder.category,
            brand_name: newManufacturingOrder.brand_name,
            company_name: newManufacturingOrder.company_name,
            manufacturing_date: newManufacturingOrder.manufacturing_date
              ? `${newManufacturingOrder.manufacturing_date}-01`
              : null,
            expiry_date: newManufacturingOrder.expiry_date
              ? `${newManufacturingOrder.expiry_date}-01`
              : null,
            status: newManufacturingOrder.status || "Unassigned",
            bottles_present: newManufacturingOrder.bottles_present,
            labels_present: newManufacturingOrder.labels_present,
            batch_number: newManufacturingOrder.batch_number,
            order_note: newManufacturingOrder.order_note,
            order_created_at: new Date().toISOString(),
            uqc: newManufacturingOrder.uqc,
          },
        ])
        .select();
  
    if (manufacturingOrderError) {
      console.error(manufacturingOrderError);
      toast({
        title: "Error",
        description: "Failed to add Manufacturing Order",
        variant: "destructive",
      });
      return;
    }
  
    const insertedOrderId = manufacturingOrderData[0].order_id;
  
    // --------------------------
    // 5️⃣ Insert Packing Groups
    // --------------------------
    const packingRows = newManufacturingOrder.packing_groups
      .filter((g) => g.packing_size && g.no_of_bottles > 0)
      .map((group) => ({
        packing_size: group.packing_size,
        no_of_bottles: group.no_of_bottles,
        manufacturing_order_id: insertedOrderId,
      }));
  
    const { error: packingError } = await supabase
      .from("packing_groups")
      .insert(packingRows);
  
    if (packingError) {
      console.error(packingError);
      toast({
        title: "Error",
        description: "Failed to add packing groups",
        variant: "destructive",
      });
      return;
    }
  
    // 🟢 Update UI instantly — add new order to the top
    // 6️⃣ Fetch full order (WITH packing groups)
    const { data: fullOrder, error: fullOrderError } = await supabase
    .from("manufacturing_orders_with_packing")
    .select("*")
    .eq("order_id", insertedOrderId)
    .single();

    if (fullOrderError) {
    console.error(fullOrderError);
    toast({ title: "Error", description: "Failed to refresh new order" });
    } else {
    // 🟢 Update UI instantly — now WITH packing groups
    setManufacturingOrders(prev => [fullOrder, ...prev]);
    }
    // setFilteredManufacturingOrders(prev => [manufacturingOrderData[0], ...prev]);
  
    // --------------------------
    // 7️⃣ Reset Form
    // --------------------------
    setNewManufacturingOrder({
      product_id: "",
      customer_id: "",
      product_name: "",
      product_description: "",
      order_quantity: 0,
      category: "Human",
      brand_name: "",
      company_name: "",
      packing_groups: [{ packing_size: "", no_of_bottles: 0 }],
      expected_delivery_date: "",
      manufacturing_date: "",
      expiry_date: "",
      batch_number: "",
      status: "Unassigned",
      bottles_present: false,
      labels_present: false,
      order_note: "",
      order_created_at: "",
      manufacturing_code: "",
      uqc: "",
    });
  
    setShowAddForm(false);
  
    // --------------------------
    // 8️⃣ Toast
    // --------------------------
    toast({
      title: "Success",
      description: "Manufacturing Order created successfully",
    });
  };
  

  const handleManufacturingOrderClick = (manufacturingOrder: ManufacturingOrder) => {
    setSelectedManufacturingOrder(manufacturingOrder);
    setShowManufacturingOrderDetails(true);
  };

  // const getLastBatchNumber = async (category: "Human" | "Veterinary") => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("manufacturing_orders")
  //       .select("batch_number")
  //       .eq("category", category)
  //       .not("batch_number", "is", null) // ✅ Filter out null batch numbers
  //       .order("created_at", { ascending: false })
  //       .limit(1);
  
  //     if (error) throw error;
  
  //     // ✅ Handle empty result or single result
  //     const previousBatchNumber = data && data.length > 0 ? data[0].batch_number : null;
  //     setPreviousBatchNumber(previousBatchNumber);
  //     return previousBatchNumber;
  //   } catch (err) {
  //     console.error("Error fetching last batch number:", err);
  //     setPreviousBatchNumber(null);
  //     return null;
  //   }
  // };
  
  // const processBatchNumber = async (order: {
  //   order_id: string;
  //   batch_number: string;
  //   category: "Human" | "Veterinary";
  // }) => {
  //   try {
  //     const { order_id, batch_number, category } = order;
      
  //     if (!batch_number || batch_number.trim() === "") {
  //       console.log("No batch number provided");
  //       return;
  //     }
  
  //     // Ensure minimum length
  //     if (batch_number.length < 5) {
  //       throw new Error("Batch number too short (minimum 5 characters)");
  //     }
  
  //     const prefix = batch_number.slice(0, 5); // e.g. SFH25 or SFV25
  //     const rest = batch_number.slice(5).toUpperCase();
  
  //     console.log("Processing batch:", { prefix, rest, full: batch_number });
  
  //     // 1️⃣ Case: Simple batch (no range)
  //     if (!rest.includes("-")) {
  //       console.log("Simple batch number, updating...");
  //       const { error } = await supabase
  //         .from("manufacturing_orders")
  //         .update({ batch_number })
  //         .eq("order_id", order_id);
  
  //       if (error) throw error;
        
  //       // Update local state
  //       setManufacturingOrders(prev =>
  //         prev.map(o => (o.order_id === order_id ? { ...o, batch_number } : o))
  //       );
        
  //       console.log("Batch number updated successfully");
  //       return;
  //     }
  
  //     // 2️⃣ Case: Range like 005-009 or A-D
  //     console.log("Range detected, processing...");
  //     const [startStr, endStr] = rest.split("-");
      
  //     // Check if numeric or alphabetic range
  //     const isNumeric = /^\d+$/.test(startStr) && /^\d+$/.test(endStr);
      
  //     let batches: string[] = [];
      
  //     if (isNumeric) {
  //       // Numeric range: 005-009
  //       const start = parseInt(startStr, 10);
  //       const end = parseInt(endStr, 10);
        
  //       if (isNaN(start) || isNaN(end)) {
  //         throw new Error("Invalid numeric batch range");
  //       }
        
  //       if (start > end) {
  //         throw new Error("Start number must be less than or equal to end number");
  //       }
        
  //       // Generate numeric batches
  //       for (let i = start; i <= end; i++) {
  //         batches.push(`${prefix}${String(i).padStart(startStr.length, "0")}`);
  //       }
  //     } else {
  //       // Alphabetic range: A-D
  //       const startChar = startStr.charCodeAt(0);
  //       const endChar = endStr.charCodeAt(0);
        
  //       if (startChar > endChar) {
  //         throw new Error("Start letter must be less than or equal to end letter");
  //       }
        
  //       // Generate alphabetic batches
  //       for (let i = startChar; i <= endChar; i++) {
  //         batches.push(`${prefix}${String.fromCharCode(i)}`);
  //       }
  //     }
  
  //     console.log("Generated batches:", batches);
  
  //     // Fetch the base order details
  //     const { data: baseOrder, error: fetchError } = await supabase
  //       .from("manufacturing_orders")
  //       .select("*")
  //       .eq("order_id", order_id)
  //       .single();
  
  //     if (fetchError) throw fetchError;
  //     if (!baseOrder) throw new Error("Order not found");
  
  //     // Update the original order with the first batch number
  //     const { error: updateError } = await supabase
  //       .from("manufacturing_orders")
  //       .update({ batch_number: batches[0] })
  //       .eq("order_id", order_id);
  
  //     if (updateError) throw updateError;
  
  //     // Create duplicate orders for the remaining batches
  //     if (batches.length > 1) {
  //       const newOrders = batches.slice(1).map(batch => {
  //         const { order_id: _, created_at, updated_at, ...orderData } = baseOrder;
  //         return {
  //           ...orderData,
  //           batch_number: batch,
  //           order_id: crypto.randomUUID(),
  //           created_at: new Date().toISOString(),
  //           updated_at: new Date().toISOString(),
  //         };
  //       });
  
  //       console.log("Inserting new orders:", newOrders.length);
  
  //       const { error: insertError } = await supabase
  //         .from("manufacturing_orders")
  //         .insert(newOrders);
  
  //       if (insertError) throw insertError;
  
  //       // Update local state with all orders
  //       setManufacturingOrders(prev => [
  //         ...prev.map(o => (o.order_id === order_id ? { ...o, batch_number: batches[0] } : o)),
  //         ...newOrders
  //       ]);
  //     } else {
  //       // Only update the existing order
  //       setManufacturingOrders(prev =>
  //         prev.map(o => (o.order_id === order_id ? { ...o, batch_number: batches[0] } : o))
  //       );
  //     }
  
  //     console.log("Batch processing complete!");
  //     alert(`Successfully created ${batches.length} batch(es): ${batches.join(", ")}`);
  //   } catch (err) {
  //     console.error("Error processing batch number:", err);
  //     alert(`Error: ${err.message}`);
  //   }
  // };
  
  // 4️⃣ Call getLastBatchNumber when editing starts or category changes
  // useEffect(() => {
  //   if (isEditing && editForm.category) {
  //     getLastBatchNumber(editForm.category);
  //   }
  // }, [isEditing, editForm.category]);
  
  const filteredManufacturingOrders = manufacturingOrders
  .filter(order => {
    // 1. Completion Filter (Completed/Incomplete)
    if (productionCompletionFilter === "Completed") {
      if (order.status !== "Dispatched") return false;
    }
    if (productionCompletionFilter === "Incomplete") {
      if (order.status === "Dispatched") return false;
    }

    // 2. Search Filter (product name, company name, brand name)
    const search = manufacturingOrderSearch.toLowerCase();
    const matchesSearch =
      (order.product_name ?? "").toLowerCase().includes(search) ||
      (order.company_name ?? "").toLowerCase().includes(search) ||
      (order.brand_name ?? "").toLowerCase().includes(search);
    
    if (!matchesSearch) return false;

    // 3. Category Filter
    const matchesCategory =
      filterCategory === "All" || order.category === filterCategory;
    
    if (!matchesCategory) return false;

    // 4. Assignment Filter
    const isAssigned = batchAssignedMap[order.order_id] || false;
    if (assignmentFilter === "Assigned" && !isAssigned) return false;
    if (assignmentFilter === "Unassigned" && isAssigned) return false;

    return true;
  })
  .sort((a, b) => Number(b.order_id) - Number(a.order_id)); // Sort by order_id descending

  // const sortedOrders = [...filteredManufacturingOrder].sort(
  //   (a, b) => Number(b.order_id) - Number(a.order_id)
  // );

  
  // const filteredOrdersByAssignment = sortedOrders.filter(order => {
  //   const isAssigned = batchAssignedMap[order.order_id] || false;
  
  //   if (assignmentFilter === "Assigned") return isAssigned;
  //   if (assignmentFilter === "Unassigned") return !isAssigned;
  //   return true;
  // });
  
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
                    autoComplete="disable-autofill"
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
                            setNewManufacturingOrder({ ...newManufacturingOrder, product_id: p.external_id, product_name: p.product_name, product_description: p.sales_description , uqc: p.uqc});
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
                    autoComplete="disable-autofill"
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
              {/* Order Quantity Calculation */}
              <div>
                <Label htmlFor="order_quantity">Order Quantity (Kg / L)</Label>

                <Input
                  id="order_quantity"
                  type="number"
                  value={
                    newManufacturingOrder.order_quantity === 0 ||
                    newManufacturingOrder.order_quantity === null
                      ? ""
                      : newManufacturingOrder.order_quantity
                  }
                  onChange={(e) =>
                    setNewManufacturingOrder({
                      ...newManufacturingOrder,
                      order_quantity: e.target.value === "" ? 0 : Number(e.target.value)
                    })
                  }
                  placeholder="Enter total quantity"
                  
                />

                <p className="text-sm pl-2 text-red-500 font-semibold mt-1">
                  Total from packing groups: {calculateTotalLiters(newManufacturingOrder.packing_groups).toFixed(2)} L
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
              {/* Packing Groups */}
              <div className="mt-4">
                <Label>Packing Sizes & Number of Bottles *</Label>

                {newManufacturingOrder.packing_groups.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-1 mb-2">
                    {/* Input Row */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <select
                        className="border rounded px-2 py-1"
                        value={group.packing_size}
                        onChange={(e) =>
                          updatePackingGroupValue(newManufacturingOrder.packing_groups, setNewManufacturingOrder, idx, "packing_size", e.target.value)
                        }
                      >
                        <option value="">Select packing size</option>
                        {filteredPackingSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>

                      <Input
                        type="number"
                        min={1}
                        placeholder="No. of bottles"
                        value={group.no_of_bottles === 0 ? "" : group.no_of_bottles}
                        onChange={(e) =>
                          updatePackingGroupValue(
                            newManufacturingOrder.packing_groups,
                            setNewManufacturingOrder,
                            idx,
                            "no_of_bottles",
                            Number(e.target.value)
                          )
                        }
                      />

                      <Button
                        variant="outline"
                        onClick={() => removePackingGroupValue(newManufacturingOrder.packing_groups, setNewManufacturingOrder, idx)}
                        disabled={newManufacturingOrder.packing_groups.length === 1}
                      >
                        Remove
                      </Button>
                    </div>

                    {/* Per-row calculation */}
                    <p className="text-sm text-red-500 font-semibold pl-1">
                      {group.packing_size && group.no_of_bottles > 0
                        ? `${group.packing_size} × ${group.no_of_bottles} = ${calculateRowLiters(group.packing_size, group.no_of_bottles).toFixed(2)} L`
                        : "Select packing size & bottles to calculate"}
                    </p>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() => addPackingGroupValue(newManufacturingOrder.packing_groups, setNewManufacturingOrder)}
                  variant="ghost"
                  className="mt-1"
                >
                  + Add packing group
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm">Add Notes for This Order.</p>
              <Textarea
                id="order-note"
                placeholder="Add a Remark..."
                value={newManufacturingOrder.order_note}
                onChange={(e) => setNewManufacturingOrder({ ...newManufacturingOrder, order_note: e.target.value })}
                className="text-s min-h-[60px]"
              />
            </div> 

            <div className="flex gap-3">
              <Button onClick={() => 
                {handleAddManufacturingOrder(); setNewManufacturingOrder({
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
                  order_created_at:"",
                  manufacturing_code: "",
                  uqc: ""
                });
                setProductSearch("");       // ✅ clear input text
                setCustomerSearch(""); }} 
                className="bg-green-500 hover:bg-green-600" 
              >
                Create Order
              </Button>
              <Button
                variant="outline"
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
                    order_created_at:"",
                    manufacturing_code: "",
                    uqc: ""
                  });
                  setProductSearch("");       // ✅ clear input text
                  setCustomerSearch("");      // ✅ clear customer input
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/*Filters*/}
      <div className="grid grid-cols-7">
        {/* Category Filter Dropdown */}
        <div className=" w-40">
          <Label htmlFor="categoryFilter" className="mb-2">Filter by Category</Label>
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
        <div className=" w-40">
          <Label htmlFor="categoryFilter" >Filter by Assignment</Label>
          <Select value={assignmentFilter} onValueChange={(val) => setAssignmentFilter(val as any)}>
            <SelectTrigger id="categoryFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Production Filter */}
        <div className=" w-40">
          <Label htmlFor="categoryFilter" >Filter by Completion </Label>
          <Select value={productionCompletionFilter} onValueChange={(val) => setProductionCompletionFilter(val as any)}>
            <SelectTrigger id="categoryFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Incomplete">Incomplete</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search input */}
        <div className="relative  col-span-4">
        <Label htmlFor="orderSearch" >Search the Orders </Label>
          <Search className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by product, brand, company "
            value={manufacturingOrderSearch}
            onChange={e => setManufacturingOrderSearch(e.target.value)}
            className="pl-8"
            id="orderSearch"
          />
        </div>
      </div>
      
      {/* Orders List */}
      <div className="grid gap-4 ">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">
            Total: {filteredManufacturingOrders.length} Orders 
          </h2>
          <Button className="bg-red-500" onClick={handleExport}>Export Excel</Button>

        </div>
        {filteredManufacturingOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No manufacturing orders found.</p>
          </Card>
        ) : (
          filteredManufacturingOrders.map((manufacturingOrder) => (
            <>
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
                      <h3 className="text-xl font-semibold text-gray-900">{manufacturingOrder.product_name} <span className="text-base">[{manufacturingOrder.manufacturing_code} ]</span></h3>
                      <p className="text-gray-600 mt-1">
                        <span className="font-bold text-gray-700">Brand: </span>{manufacturingOrder.brand_name} | <span className="font-bold text-gray-700">Company: </span> {manufacturingOrder.company_name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-xs">
                          Batch: {manufacturingOrder.batch_number ?? "Unassigned"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          manufacturingOrder.category === "Human" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {manufacturingOrder.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(manufacturingOrder.status)}`}>
                          {manufacturingOrder.status}
                        </span>
                        <span>
                          <p className="text-right text-xs text-cyan-800 space-y-1 bg-cyan-100 rounded-full px-2 py-1" ><span className="">Delivery Date:</span> {manufacturingOrder.expected_delivery_date || "N.A"}</p>
                        </span>
                        {manufacturingOrder.order_note ? (<span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-200 text-pink-800">Remark: {manufacturingOrder.order_note}</span>) : (<span></span>)}
                      </div>
                    </div>
                    <div key={manufacturingOrder.order_id} className="text-right text-sm text-gray-500 space-y-1 text-center">
                      <p className="bg-pink-100 text-pink-900 rounded-full px-2 py-1">
                        Quantity: {manufacturingOrder.order_quantity || "0"}{manufacturingOrder.uqc === "BTL" ? "L" : "Kg"}
                      </p>
                      <div className="flex flex-col gap-2">
                        {Array.isArray(manufacturingOrder.packing_groups) &&
                          manufacturingOrder.packing_groups.map((group, index) => (
                            <span
                              key={index}
                              className="py-1 bg-green-100 text-green-700 rounded-full text-xs text-center"
                            >
                              {group.packing_size || "N/A"} : {group.no_of_bottles || 0}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ))
        )}
      </div>

      {/*Assign Values Modal*/}
      <Dialog
        open={assignmentDetails}
        onOpenChange={(open) => {
          setAssignmentDetails(open);

          // When closing modal → exit editing mode & reset form
          if (!open) {
            setIsEditing(false);

            if (selectedManufacturingOrder) {
              setEditForm({
                order_id: selectedManufacturingOrder.order_id,
                product_name: selectedManufacturingOrder.product_name,
                product_description: selectedManufacturingOrder.product_description,
                category: selectedManufacturingOrder.category,
                order_quantity: selectedManufacturingOrder.order_quantity,
                brand_name: selectedManufacturingOrder.brand_name,
                company_name: selectedManufacturingOrder.company_name,
                packing_groups: [...(selectedManufacturingOrder.packing_groups || [])],
                status: selectedManufacturingOrder.status,
                batch_number: selectedManufacturingOrder.batch_number,
                bottles_present: Boolean(selectedManufacturingOrder.bottles_present),
                labels_present: Boolean(selectedManufacturingOrder.labels_present),
                order_note: selectedManufacturingOrder.order_note,
                uqc: selectedManufacturingOrder.uqc
              });
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-800 mb-2 border-b-2 border-gray-200 pb-1">Manufacturing Order Details</span>
              </DialogTitle>
          </DialogHeader>
                
                {selectedManufacturingOrder && (
                  <>
                    <div className="grid grid-cols-2 ">
                      {/* Bottles Present */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-900">
                          Bottles: 
                        </label>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = !editForm.bottles_present;
                                console.log("🔴 Toggling bottles_present from", editForm.bottles_present, "to", newValue);
                                setEditForm({ ...editForm, bottles_present: newValue });
                              }}
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
                            <span className="text-xs text-gray-600">
                              {editForm.bottles_present ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {selectedManufacturingOrder.bottles_present ? "In Stock ✅" : "Out of Stock ❌"}
                          </span>
                        )}
                      </div>

                      {/* Labels Present */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-900">
                          Labels: 
                        </label>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = !editForm.labels_present;
                                console.log("🔵 Toggling labels_present from", editForm.labels_present, "to", newValue);
                                setEditForm({ ...editForm, labels_present: newValue });
                              }}
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
                            <span className="text-xs text-gray-600">
                              {editForm.labels_present ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {selectedManufacturingOrder.labels_present ? "In Stock ✅" : "Out of Stock ❌"}
                          </span>
                        )}
                      </div>
                    </div>
                    {/*Manufacturing Order Notes */}
                    <div>
                      {isEditing ? 
                        (
                          <div className="flex flex-col">
                            <label className="text-sm font-bold text-gray-900 mb-1">
                              Order Remark : 
                            </label>
                            <Input
                              value={editForm.order_note ?? ""}
                              onChange={e => setEditForm({ ...editForm, order_note: e.target.value })}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                            <h3 className="text-sm font-bold text-gray-900">
                            Order Remark :
                            </h3>
                            <span className="text-sm">{selectedManufacturingOrder.order_note}</span>
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
                        <p className="text-sm text-gray-600">
                          Previous Batch: {previousBatchNumber || "None"}
                        </p>
                      </div>
                      ):(
                        <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                          <p className="text-sm font-bold text-gray-900 ">
                          Batch Number :
                          </p>
                          <span className="text-sm">{selectedManufacturingOrder.batch_number || "Unassigned"}</span>
                        </div>
                      )
                    }
                  </>
                ) }
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
                            batch_number: editForm.batch_number,
                            status: selectedManufacturingOrder.status === "Unassigned" && editForm.batch_number
                              ? "InQueue"
                              : selectedManufacturingOrder.status,
                            bottles_present: editForm.bottles_present,  // ✅ Using editForm
                            labels_present: editForm.labels_present,
                            order_note: editForm.order_note,    // ✅ Using editForm
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

                        // 3) ✅ REFETCH from database to ensure consistency
                        const { data: refreshedData, error: fetchError } = await supabase
                          .from("manufacturing_orders_with_packing")
                          .select("*")
                          .eq("order_id", selectedManufacturingOrder.order_id)
                          .single();

                        if (fetchError || !refreshedData) {
                          console.error(fetchError);
                          toast({ title: 'Error', description: 'Failed to refresh order data.' });
                          return;
                        }

                        // Ensure booleans are properly typed
                        const refreshedOrder = {
                          ...refreshedData,
                          bottles_present: Boolean(refreshedData.bottles_present),
                          labels_present: Boolean(refreshedData.labels_present),
                        };

                        // Update local state
                        setManufacturingOrders(prev =>
                          prev.map(o => o.order_id === refreshedOrder.order_id ? refreshedOrder : o)
                        );
                        setSelectedManufacturingOrder(refreshedOrder);
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
                          product_description: selectedManufacturingOrder.product_description,
                          category: selectedManufacturingOrder.category,
                          order_quantity:selectedManufacturingOrder.order_quantity,
                          brand_name:selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...selectedManufacturingOrder.packing_groups],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          bottles_present: selectedManufacturingOrder.bottles_present,
                          labels_present: selectedManufacturingOrder.labels_present,
                          order_note: selectedManufacturingOrder.order_note,
                          uqc: selectedManufacturingOrder.uqc
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
                    className="bg-gray-300 hover:bg-gray-500 hover:text-white"
                      variant="outline"
                      onClick={() => {
                        console.log("🟢 order_note value:", selectedManufacturingOrder.order_note);
                        console.log("🟢 Full order:", selectedManufacturingOrder);
                        
                        setEditForm({
                          order_id: selectedManufacturingOrder.order_id,
                          product_name: selectedManufacturingOrder.product_name,
                          product_description: selectedManufacturingOrder.product_description,
                          category: selectedManufacturingOrder.category,
                          order_quantity: selectedManufacturingOrder.order_quantity,
                          brand_name: selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...(selectedManufacturingOrder.packing_groups || [])],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          bottles_present: Boolean(selectedManufacturingOrder.bottles_present), // ✅ Explicit conversion
                          labels_present: Boolean(selectedManufacturingOrder.labels_present), // ✅ Explicit conversion
                          order_note: selectedManufacturingOrder.order_note,  
                          uqc: selectedManufacturingOrder.uqc
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit ManufacturingOrder
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                      className="bg-red-400 text-black hover:bg-red-700 hover:text-white"
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
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={showManufacturingOrderDetails} onOpenChange={(open) => {
          setShowManufacturingOrderDetails(open);

          if (!open && isEditing) {
            // Reset edit mode and form when modal closes
            setIsEditing(false);
            setEditForm({
              order_id:selectedManufacturingOrder.order_id,
              product_name: selectedManufacturingOrder.product_name,
              product_description: selectedManufacturingOrder.product_description,
              category: selectedManufacturingOrder.category,
              order_quantity: selectedManufacturingOrder.order_quantity,
              brand_name: selectedManufacturingOrder.brand_name,
              company_name: selectedManufacturingOrder.company_name,
              packing_groups: [...selectedManufacturingOrder.packing_groups],
              batch_number: selectedManufacturingOrder.batch_number,
              status: selectedManufacturingOrder.status,
              bottles_present: selectedManufacturingOrder.bottles_present,
              labels_present: selectedManufacturingOrder.labels_present,
              order_note: selectedManufacturingOrder.order_note,
              uqc: selectedManufacturingOrder.uqc
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
                {/* Product Name*/}
                <div>
                  <p className="text-xl text-gray-900 mb-2">
                    {isEditing ? (
                      <div className="relative">
                        <div className="relative">
                          <p className="text-sm font-bold text-gray-900">Product:</p>
                          <Input
                            value={editForm.product_name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm({ ...editForm, product_name: value });
                              setShowProductDropdown(value.length > 0);
                            }}
                            onFocus={() => {
                              if (editForm.product_name.length > 0) setShowProductDropdown(true);
                            }}
                            autoComplete="off"
                            placeholder="Enter your product details"
                          />

                          {showProductDropdown && editForm.product_name && (
                            <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto">
                              {filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                  <li
                                    key={p.external_id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setEditForm({
                                        ...editForm,
                                        product_name: p.product_name,
                                        product_description: p.sales_description,
                                        uqc: p.uqc
                                      });
                                      setShowProductDropdown(false);
                                    }}
                                  >
                                    <span className="text-sm text-black-500 mr-2">[{p.external_id}]</span>
                                    <span className="text-sm">{p.product_name}</span>
                                    <span className="text-gray-400 text-xs"> — {p.sales_description}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="p-2 text-gray-400">No products found</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-gray-900 ">Product:  <span className="text-sm font-semibold">{selectedManufacturingOrder.product_name}</span> </p>
                      </div>
                    )}
                  </p>
                </div>

                {/* Product Description*/}
                <div>
                  <p className="text-xl text-gray-900 mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900 ">Product Desc:  <span className="text-sm font-semibold">
                        {isEditing ? editForm.product_description : selectedManufacturingOrder.product_description}
                      </span> </p>
                    </div>
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
                              const value = e.target.value;
                              setEditForm({ ...editForm, company_name: e.target.value });
                              setCustomerSearch(value);
                              setShowCustomerDropdown(value.length > 0);
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
                                key={c.customer_code}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setEditForm({
                                    ...editForm,
                                    company_name: c.company_name,
                                  });
                                  setShowCustomerDropdown(false);
                                }}
                              >
                                <span className="text-sm text-black-500 mr-2">[{c.customer_code}]</span>
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

              {/* Manufacturing Order Quantity (L) */}
              <div>
                {isEditing ? (
                  <>
                    {/* Order Quantity */}
                    <Label htmlFor="order_quantity">Order Quantity (Kg / L)</Label>

                    <Input
                      id="order_quantity"
                      type="number"
                      value={editForm.order_quantity === 0 ? "" : editForm.order_quantity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          order_quantity: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                      placeholder="Enter total quantity"
                    />

                    <p className="text-sm pl-2 text-gray-500 mt-1">
                      Total from packing groups: {calculateTotalLiters(editForm.packing_groups).toFixed(2)} L
                    </p>

                    {/* Packing Groups */}
                    <div className="mt-4">
                      <Label>Packing Sizes & Number of Bottles *</Label>

                      {editForm.packing_groups.map((group, idx) => (
                        <div key={idx} className="flex flex-col gap-1 mb-2">
                          {/* Input Row */}
                          <div className="grid grid-cols-3 gap-4 items-center">
                            <select
                              className="border rounded px-2 py-1"
                              value={group.packing_size}
                              onChange={(e) =>
                                updatePackingGroupValue(editForm.packing_groups, setEditForm, idx, "packing_size", e.target.value)
                              }
                            >
                              <option value="">Select packing size</option>
                              {(products.find((p) => p.external_id === selectedManufacturingOrder.product_id)?.packing_sizes || []).map(
                                (size: string) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                )
                              )}
                            </select>

                            <Input
                              type="number"
                              min={1}
                              placeholder="No. of bottles"
                              value={group.no_of_bottles === 0 ? "" : group.no_of_bottles}
                              onChange={(e) =>
                                updatePackingGroupValue(
                                  editForm.packing_groups,
                                  setEditForm,
                                  idx,
                                  "no_of_bottles",
                                  e.target.value === "" ? 0 : Number(e.target.value)
                                )
                              }
                            />

                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => removePackingGroupValue(editForm.packing_groups, setEditForm, idx)}
                              disabled={editForm.packing_groups.length === 1}
                            >
                              Remove
                            </Button>
                          </div>

                          {/* Per-row calculation */}
                          <p className="text-sm text-red-500 font-semibold pl-1">
                            {group.packing_size && group.no_of_bottles > 0
                              ? `${group.packing_size} × ${group.no_of_bottles} = ${calculateRowLiters(group.packing_size, group.no_of_bottles).toFixed(2)} L`
                              : "Select packing size & bottles to calculate"}
                          </p>
                        </div>
                      ))}

                      <Button
                        type="button"
                        onClick={() => addPackingGroupValue(editForm.packing_groups, setEditForm)}
                        variant="ghost"
                        className="mt-1"
                      >
                        + Add packing group
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedManufacturingOrder.packing_groups?.length ? (
                      selectedManufacturingOrder.packing_groups.map((group, index) => (
                        <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                          {group.packing_size} : {group.no_of_bottles}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm">
                        <span className="text-lg font-semibold text-gray-900">Packing Group :</span> No packing groups have been chosen
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottles Present */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-900">
                  Bottles: 
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = !editForm.bottles_present;
                        console.log("🔴 Toggling bottles_present from", editForm.bottles_present, "to", newValue);
                        setEditForm({ ...editForm, bottles_present: newValue });
                      }}
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
                    <span className="text-xs text-gray-600">
                      {editForm.bottles_present ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-700">
                    {selectedManufacturingOrder.bottles_present ? "In Stock ✅" : "Out of Stock ❌"}
                  </span>
                )}
              </div>

              {/* Labels Present */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-900">
                  Labels: 
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = !editForm.labels_present;
                        console.log("🔵 Toggling labels_present from", editForm.labels_present, "to", newValue);
                        setEditForm({ ...editForm, labels_present: newValue });
                      }}
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
                    <span className="text-xs text-gray-600">
                      {editForm.labels_present ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-700">
                    {selectedManufacturingOrder.labels_present ? "In Stock ✅" : "Out of Stock ❌"}
                  </span>
                )}
              </div>
              
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

              {/*Manufacturing Order Notes */}
              <div>
                {isEditing ? 
                  (
                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-gray-900 mb-1">
                        Order Remark : 
                      </label>
                      <Input
                        value={editForm.order_note ?? ""}
                        onChange={e => setEditForm({ ...editForm, order_note: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                      <h3 className="text-sm font-bold text-gray-900">
                      Order Remark :
                      </h3>
                      <span className="text-sm">{selectedManufacturingOrder.order_note}</span>
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
              {isEditing ? (
              <div className="my-4">
                <Label className="pb-1 text-sm font-bold text-gray-900">Batch Number</Label>

                {/* Manual Input Field */}
                <Input
                  value={editForm.batch_number ?? ""}
                  onChange={e => setEditForm({ 
                    ...editForm, 
                    batch_number: e.target.value.toUpperCase() 
                  })}
                  placeholder={` ${batchInfo?.nextBatch || "SFH25001"} `}
                  disabled={isProcessing}
                />
                <span className="text-gray-600 text-xs">
                  Last Batch Number: <span className=" text-gray-800">
                  {batchInfo?.lastBatch || "None"}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-700 leading-relaxed">
                <p className="text-sm font-bold text-gray-900">Batch Number:</p>
                <span className="text-sm font-mono">
                  {selectedManufacturingOrder.batch_number || "Unassigned"}
                </span>
              </div>
            )}
                            
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    {/* SAVE BUTTON */}
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={handleSaveOrder}
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
                          product_description: selectedManufacturingOrder.product_description,
                          category: selectedManufacturingOrder.category,
                          order_quantity:selectedManufacturingOrder.order_quantity,
                          brand_name:selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...selectedManufacturingOrder.packing_groups],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          bottles_present: selectedManufacturingOrder.bottles_present,
                          labels_present: selectedManufacturingOrder.labels_present,
                          order_note: selectedManufacturingOrder.order_note,
                          uqc: selectedManufacturingOrder.uqc
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
                    className="bg-gray-300 hover:bg-gray-500 hover:text-white"
                      variant="outline"
                      onClick={() => {
                        console.log("🟢 order_note value:", selectedManufacturingOrder.order_note);
                        console.log("🟢 Full order:", selectedManufacturingOrder);
                        
                        setEditForm({
                          order_id: selectedManufacturingOrder.order_id,
                          product_name: selectedManufacturingOrder.product_name,
                          product_description: selectedManufacturingOrder.product_description,
                          category: selectedManufacturingOrder.category,
                          order_quantity: selectedManufacturingOrder.order_quantity,
                          brand_name: selectedManufacturingOrder.brand_name,
                          company_name: selectedManufacturingOrder.company_name,
                          packing_groups: [...(selectedManufacturingOrder.packing_groups || [])],
                          status: selectedManufacturingOrder.status,
                          batch_number: selectedManufacturingOrder.batch_number,
                          bottles_present: Boolean(selectedManufacturingOrder.bottles_present), // ✅ Explicit conversion
                          labels_present: Boolean(selectedManufacturingOrder.labels_present), // ✅ Explicit conversion
                          order_note: selectedManufacturingOrder.order_note,  
                          uqc: selectedManufacturingOrder.uqc
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit ManufacturingOrder
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                      className="bg-red-400 text-black hover:bg-red-700 hover:text-white"
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
                    <Button className="bg-cyan-400 text-black hover:bg-cyan-600 hover:text-white" onClick={() => {
                      setSelectedManufacturingOrder(selectedManufacturingOrder);

                      setEditForm({
                        order_id: selectedManufacturingOrder.order_id,
                        product_name: selectedManufacturingOrder.product_name,
                        product_description: selectedManufacturingOrder.product_description,
                        category: selectedManufacturingOrder.category,
                        order_quantity: selectedManufacturingOrder.order_quantity,
                        brand_name: selectedManufacturingOrder.brand_name,
                        company_name: selectedManufacturingOrder.company_name,
                        packing_groups: [...(selectedManufacturingOrder.packing_groups || [])],
                        status: selectedManufacturingOrder.status,
                        batch_number: selectedManufacturingOrder.batch_number,
                        bottles_present: Boolean(selectedManufacturingOrder.bottles_present),
                        labels_present: Boolean(selectedManufacturingOrder.labels_present),
                        order_note: selectedManufacturingOrder.order_note,
                        uqc: selectedManufacturingOrder.uqc
                      });

                      setAssignmentDetails(true);   // open modal
                      setIsEditing(true);           // 🔥 auto-enable editing
                    }}>
                      Assign
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
