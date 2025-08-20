import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Upload, Search, X, Download, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";
// import * as XLSX from 'xlsx';

// import initialProducts from "../data/product.js";
import { saveAs } from 'file-saver';
import { useRef } from "react";

interface Product {
  external_id: string;
  product_name: string;
  category: "Human" | "Veterinary";
  sub_category: "Antibiotic" | "Antihelmintic" | "Antihistamine" | "Cough/Cold" | "Digestive/Laxative" | "Electrolyte/Other" | "Vitamin/Supplement" | "Analgesic/Antipyretic";
  common_description: string;
  internal_reference: string;
  sales_description: string;
  packing_sizes: string[];
  uqc: "BTL" | "PCS";
}



const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { toast } = useToast();
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProduct, setNewProduct] = useState({
    externalId: "",
    productName: "",
    category: "Human" as "Human" | "Veterinary",
    subCategory: "Antibiotic" as "Antibiotic" | "Antihelmintic" | "Antihistamine" | "Cough/Cold" | "Digestive/Laxative" | "Electrolyte/Other" | "Vitamin/Supplement" | "Analgesic/Antipyretic",
    commonDescription: "",
    internalReference: "",
    salesDescription: "",
    packingSizes: [""],
    uqc: 'BTL' as 'BTL' | 'PCS',
    primaryUnit: "",
    hsnCode: "",
    taxPercentage: 0,

  });
  const [parentCategoryFilter, setParentCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");

  const subCategories = {
    Human: [
      "Analgesic/Antipyretic",
      "Antibiotic",
      "Antihelmintic",
      "Antihistamine",
      "Cough/Cold",
      "Digestive/Laxative",
      "Electrolyte/Other",
      "Vitamin/Supplement"
    ],
    Veterinary: [
      "Analgesic/Antipyretic",
      "Antibiotic",
      "Antihelmintic",
      "Antihistamine",
      "Cough/Cold",
      "Digestive/Laxative",
      "Electrolyte/Other"
    ]
  };
  const subCategoryColorMap: { [key: string]: string } = {
    "Antibiotic": "bg-red-100 text-red-800 hover:bg-red-200",
    "Antihelmintic": "bg-amber-100 text-amber-800 hover:bg-amber-200",
    "Antihistamine": "bg-teal-100 text-teal-800 hover:bg-teal-200",
    "Cough/Cold": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "Digestive/Laxative": "bg-green-100 text-green-800 hover:bg-green-200",
    "Electrolyte/Other": "bg-rose-100 text-rose-800 hover:bg-rose-200",
    "Vitamin/Supplement": "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200",
    "Analgesic/Antipyretic": "bg-orange-100 text-orange-800 hover:bg-orange-200",
  };
  
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    external_id: '',
    product_name: '', 
    category: 'Human' as 'Human' | 'Veterinary',
    sub_category: 'Antibiotic' as 'Antibiotic' | 'Antihelmintic' | 'Antihistamine' | 'Cough/Cold' | 'Digestive/Laxative' | 'Electrolyte/Other' | 'Vitamin/Supplement' | 'Analgesic/Antipyretic',
    common_description: '',
    internal_reference: '',
    sales_description: '',
    packing_sizes: [''],
    uqc: 'BTL' as 'BTL' | 'PCS',

  });
  
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("product_with_sizes")
        .select("*");
  
      if (error) {
        console.error("Failed to load products", error);
      } else {
        setProducts(data);
      }
    };
  
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    if (
      !newProduct.externalId ||
      !newProduct.productName ||
      !newProduct.category ||
      !newProduct.subCategory ||
      !newProduct.salesDescription ||
      !newProduct.packingSizes ||
      !newProduct.hsnCode ||
      !newProduct.taxPercentage 
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  
    // 1️⃣ Insert product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([{
        external_id: newProduct.externalId,
        product_name: newProduct.productName,
        category: newProduct.category,
        sub_category: newProduct.subCategory,
        sales_description: newProduct.salesDescription,
      }])
      .select();
  
    if (productError) {
      console.error(productError);
      toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
      return;
    }
  
    // 2️⃣ Insert packing sizes
    const packingSizeRows = newProduct.packingSizes
      .filter(s => s.trim() !== "")
      .map(size => ({
        product_external_id: productData[0].external_id,
        size
      }));
  
    const { error: packingError } = await supabase
      .from("packing_sizes")
      .insert(packingSizeRows);
  
    if (packingError) {
      console.error(packingError);
      toast({ title: "Error", description: "Failed to add packing sizes", variant: "destructive" });
      return;
    }
  
    // 3️⃣ Update local state
    setProducts([...products, {
      ...productData[0],
      packing_sizes: newProduct.packingSizes
    }]);
  
    // 4️⃣ Reset form
    setNewProduct({
      externalId: "",
      productName: "",
      category: "Human",
      subCategory: "Antibiotic",
      commonDescription: "",
      internalReference: "",
      salesDescription: "",
      packingSizes: [""],
      uqc: "BTL",
      hsnCode: "",
      taxPercentage: 0,
      primaryUnit: ""
    });
    setShowAddForm(false);
  
    toast({
      title: "Success",
      description: "Product added successfully"
    });
  };
  

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // const handleDownloadProducts = () => {
  //   // Prepare data for export (flatten arrays, etc.)
  //   const exportData = products.map(product => ({
  //     "External ID": product.external_id,
  //     "Product Name": product.product_name,
  //     "Category": product.category,
  //     "Sub-Category": product.sub_category,
  //     "Common Description": product.common_description,
  //     "Internal Reference": product.internal_reference,
  //     "Sales Description": product.sales_description,
  //     "Packing Sizes": product.packing_sizes.join(", "),
  //     "UQC": product.uqc,
  //   }));
  
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "products.xlsx");
  // };
  // const handleImportProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  
  //   const reader = new FileReader();
  //   reader.onload = (evt) => {
  //     const result = evt.target?.result;
  //     if (!result || typeof result === "string") {
  //       toast({
  //         title: "Import Failed",
  //         description: "Invalid file format.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }
  //     const data = new Uint8Array(result);
  //     const workbook = XLSX.read(data, { type: "array" });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];
  //     const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  //     // Map the imported data to your product structure
  //     const importedProducts = jsonData.map((row: any, idx: number) => ({
  //       external_id: row["External ID"] || `imported-${idx}`,
  //       product_name: row["Product Name"] || "",
  //       category: row["Category"] === "Veterinary" ? "Veterinary" : "Human",
  //       sub_category: row["Sub-Category"] === "Antibiotic" || "Antihelmintic" || "Antihistamine" || "Cough/Cold" || "Digestive/Laxative" || "Electrolyte/Other" || "Vitamin/Supplement" || "Analgesic/Antipyretic",
  //       common_description: row["Common Description"]|| "",
  //       internal_reference: row["Internal Reference"] || "",
  //       sales_description: row["Description"] || "",
  //       packing_sizes: typeof row["Packing Sizes"] === "string" ? row["Packing Sizes"].split(",").map((s: string) => s.trim()) : [],
  //       uqc: row["UQC"] || "",
  //     }));
  
  //     setProducts([...products, ...importedProducts]);
  //     toast({
  //       title: "Import Successful",
  //       description: `${importedProducts.length} products imported.`,
  //     });
  
  //     // Clear file input
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   };
  //   reader.readAsArrayBuffer(file);
  // };
  
  const filteredProducts = products.filter(product =>
    // Parent category filter
    (parentCategoryFilter !== "all" ? product.category === parentCategoryFilter : true) &&

     // Subcategory filter (only if subCategoryFilter is not empty)
     (!subCategoryFilter || product["sub_category"] === subCategoryFilter) &&
    
    // Search match
    (
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sales_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.internal_reference.toLowerCase().includes(searchTerm.toLowerCase())
    )    
  );

  // const filteredProducts = async () => {
  //   let query = supabase
  //     .from("product_with_sizes") // your main table name
  //     .select("*");
  
  //   // Parent category filter
  //   if (parentCategoryFilter !== "all") {
  //     query = query.eq("category", parentCategoryFilter);
  //   }
  
  //   // Subcategory filter
  //   if (subCategoryFilter) {
  //     query = query.eq("sub_category", subCategoryFilter);
  //   }
  
  //   // Search filter (case-insensitive match in multiple fields)
  //   if (searchTerm) {
  //     query = query.or(
  //       `product_name.ilike.%${searchTerm}%,` +
  //       `sales_description.ilike.%${searchTerm}%,` +
  //       `external_id.ilike.%${searchTerm}%,` +
  //       `internal_reference.ilike.%${searchTerm}%`
  //     );
  //   }
  
  //   // Sorting (optional)
  //   query = query.order("product_name", { ascending: true });
  
  //   // Run query
  //   const { data, error } = await query;
  
  //   if (error) {
  //     console.error("Error fetching filtered products:", error);
  //     return [];
  //   }
  
  //   console.log("Filtered products:", data);
  //   return data;
  // };
  
  // const testQuery = async () => {
  //   const { data, error } = await supabase
  //     .from("products") // make sure this is exactly your table name
  //     .select("*") // get everything
  //     .limit(2); // limit for testing
  
  //   if (error) {
  //     console.error("Error:", error);
  //   } else {
  //     console.log("Test data:", data);
  //   }
  // };
  
  // testQuery();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <div className="flex gap-3">
        {/* <input }
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportProducts}
        />*/}
          {/* <Button
            variant="outline"
            onClick={handleDownloadProducts}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Product Data
          </Button> */}
          {/* <Button
            variant="outline"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </Button> */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search products by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="externalId">External ID *</Label>
                <Input
                  id="externalId"
                  value={newProduct.externalId}
                  onChange={(e) => setNewProduct({...newProduct, externalId: e.target.value})}
                  placeholder="Enter external ID"
                />
              </div>
              <div>
                <Label htmlFor="genericName">Product Name *</Label>
                <Input
                  id="genericName"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={newProduct.category} onValueChange={(value: "Human" | "Veterinary") => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Human">Human</SelectItem>
                    <SelectItem value="Veterinary">Veterinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subCategory">Sub Category *</Label>
                <Select value={newProduct.subCategory} onValueChange={(value: 'Antibiotic' | 'Antihelmintic' | 'Antihistamine' | 'Cough/Cold' | 'Digestive/Laxative' | 'Electrolyte/Other' | 'Vitamin/Supplement' | 'Analgesic/Antipyretic') => setNewProduct({...newProduct, subCategory: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                      <SelectItem value="Antibiotic" >Antibiotic</SelectItem>
                      <SelectItem value="Antihelmintic">Antihelmintic</SelectItem>
                      <SelectItem value="Antihistamine">Antihistamine</SelectItem>
                      <SelectItem value="Cough/Cold">Cough/Cold</SelectItem>
                      <SelectItem value="Digestive/Laxative">Digestive/Laxative</SelectItem>
                      <SelectItem value="Electrolyte/Other">Electrolyte/Other</SelectItem>
                      <SelectItem value="Vitamin/Supplement">Vitamin/Supplement</SelectItem>
                      <SelectItem value="Analgesic/Antipyretic">Analgesic/Antipyretic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            

            <div>
              <Label htmlFor="salesDescription">Product Description *</Label>
              <Textarea
                id="description"
                value={newProduct.salesDescription}
                onChange={(e) => setNewProduct({...newProduct, salesDescription: e.target.value})}
                placeholder="Enter product description"
              />
            </div>
            {/* <div >
              <div>
                <Label >Packing Sizes </Label>
                <Input
                  id="packingSizes"
                  value={newProduct.packingSizes}
                  onChange={(e) => setNewProduct({...newProduct, packingSizes: e.target.value})}
                  placeholder="60ml, 100ml, 200ml"
                />
              </div>
              <div>
                <Label htmlFor="primaryUnit">Primary Unit</Label>
                <Input
                  id="primaryUnit"
                  value={newProduct.primaryUnit}
                  onChange={(e) => setNewProduct({...newProduct, primaryUnit: e.target.value})}
                  placeholder="ml, tablets, etc."
                />
              </div>
            </div> */}
            <Label htmlFor="packingSizes">Packing Sizes *</Label>
            <div className="grid grid-rows-1 gap-4">
              {newProduct.packingSizes.map((size, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    value={size}
                    onChange={e => {
                      const updated = [...newProduct.packingSizes];
                      updated[idx] = e.target.value;
                      setNewProduct({ ...newProduct, packingSizes: updated });
                    }}
                    placeholder="e.g. 60ml"
                  />
                  {newProduct.packingSizes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewProduct({
                          ...newProduct,
                          packingSizes: newProduct.packingSizes.filter((_, i) => i !== idx)
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setNewProduct({
                    ...newProduct,
                    packingSizes: [...newProduct.packingSizes, ""]
                  })
                }
              >
                Add Packing Size
              </Button>
            </div>
            <div>
              <div>
                <Label htmlFor="primaryUnit">Primary Unit</Label>
                <Input
                  id="primaryUnit"
                  value={newProduct.primaryUnit}
                  onChange={e => setNewProduct({ ...newProduct, primaryUnit: e.target.value })}
                  placeholder="ml, tablets, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={newProduct.hsnCode}
                  onChange={(e) => setNewProduct({...newProduct, hsnCode: e.target.value})}
                  placeholder="Enter HSN code"
                />
              </div>
              <div>
                <Label htmlFor="taxPercentage">Tax %</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  value={newProduct.taxPercentage}
                  onChange={(e) => setNewProduct({...newProduct, taxPercentage: Number(e.target.value)})}
                  placeholder="Enter tax percentage"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddProduct} className="bg-green-500 hover:bg-green-600">
                Add Product
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="flex gap-4 mb-4">
        <Select
          value={parentCategoryFilter}
          onValueChange={value => {
            setParentCategoryFilter(value);
            setSubCategoryFilter(""); // Reset subcategory on parent change
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Human">Human</SelectItem>
            <SelectItem value="Veterinary">Veterinary</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Render subcategory dropdown only if a valid parent category is selected */}
        {parentCategoryFilter && subCategories[parentCategoryFilter]?.length > 0 && (
          <Select
            value={subCategoryFilter}
            onValueChange={value => setSubCategoryFilter(value)}
            
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subCategories[parentCategoryFilter].map((sub, idx) => (
                <SelectItem key={idx} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No products found. Add your first product to get started.</p>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.external_id} className="hover:shadow-md transition-shadow" onClick={() => handleProductClick(product)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="mt-3 mr-3 p-3 bg-gray-100 rounded-xl">
                    <Pill className="w-6 h-7"/>
                  </div>
                  <div className="flex-1 ">
                    <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
                    <p className="text-gray-600 mt-1 max-w-5xl">{product.sales_description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.category === "Human"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>{product.category}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${subCategoryColorMap[product.sub_category]}`}>
                        {product.sub_category}
                      </span>
                      {product.packing_sizes.map((size, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-2">
                    <p>Ref: {product.internal_reference}</p>
                    <p>ID: {product.external_id}</p>
                    <p>UQC: {product.uqc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Product Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <Input
                      value={editForm.product_name}
                      onChange={e => setEditForm({ ...editForm, product_name: e.target.value })}
                    />
                  ) : (
                    selectedProduct.product_name
                  )}
                </h2>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProduct.category === "Human"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>{selectedProduct.category}</span>

                  )}
                  {isEditing ? (
                    <Select
                      value={editForm.sub_category}
                      onValueChange={value => setEditForm({ ...editForm, sub_category: value as 'Antibiotic' | 'Antihelmintic' | 'Antihistamine' | 'Cough/Cold' | 'Digestive/Laxative' | 'Electrolyte/Other' | 'Vitamin/Supplement' | 'Analgesic/Antipyretic' })}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Antibiotic" >Antibiotic</SelectItem>
                        <SelectItem value="Antihelmintic">Antihelmintic</SelectItem>
                        <SelectItem value="Antihistamine">Antihistamine</SelectItem>
                        <SelectItem value="Cough/Cold">Cough/Cold</SelectItem>
                        <SelectItem value="Digestive/Laxative">Digestive/Laxative</SelectItem>
                        <SelectItem value="Electrolyte/Other">Electrolyte/Other</SelectItem>
                        <SelectItem value="Vitamin/Supplement">Vitamin/Supplement</SelectItem>
                        <SelectItem value="Analgesic/Antipyretic">Analgesic/Antipyretic</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${Object.entries(subCategoryColorMap).map(([key, className]) => (
                      <SelectItem key={key} value={key} className={className}>
                        {key}
                      </SelectItem>
                    ))}`}>{selectedProduct.sub_category}</span>

                  )}
                  {isEditing ?(<Textarea value={editForm.external_id} 
                  onChange={e => setEditForm({ ...editForm, external_id: e.target.value })}
                  />
                  ):(
                  <p className="text-sm text-gray-500">
                    ID: {selectedProduct.external_id}
                  </p>)
                  }
                  
                  
                </div>
              </div>
              {/* Product Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                {isEditing ? (
                  <Textarea
                    value={editForm.sales_description}
                    onChange={e => setEditForm({ ...editForm, sales_description: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProduct.sales_description}
                  </p>
                )}
              </div>
              {/* Packing Sizes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Packing Sizes</h3>
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    {editForm.packing_sizes.map((size, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          value={size}
                          onChange={e => {
                            const newSizes = [...editForm.packing_sizes];
                            newSizes[idx] = e.target.value;
                            setEditForm({ ...editForm, packing_sizes: newSizes });
                          }}
                          className="w-40"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newSizes = editForm.packing_sizes.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, packing_sizes: newSizes.length ? newSizes : [''] });
                          }}
                          disabled={editForm.packing_sizes.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditForm({ ...editForm, packing_sizes: [...editForm.packing_sizes, ''] })}
                    >
                      Add Size
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.packing_sizes.map((size, index) => (
                      <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        {size}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reference Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internal Reference:</span>
                      <span className="font-medium">{isEditing ? editForm.internal_reference : selectedProduct.internal_reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">External ID:</span>
                      <span className="font-medium">{selectedProduct.external_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">UQC:</span>
                      <span className="font-medium">{isEditing ? editForm.uqc : selectedProduct.uqc || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Category</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{isEditing ? editForm.category : selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Packing Options:</span>
                      <span className="font-medium">{isEditing ? editForm.packing_sizes.length : selectedProduct.packing_sizes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    {/* SAVE BUTTON */}
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={async () => {
                        // 1️⃣ Update product
                        const { error: productError } = await supabase
                          .from("products")
                          .update({
                            product_name: editForm.product_name,
                            category: editForm.category,
                            sub_category: editForm.sub_category,
                            common_description: editForm.common_description,
                            internal_reference: editForm.internal_reference,
                            sales_description: editForm.sales_description,
                            uqc: editForm.uqc
                          })
                          .eq("external_id", editForm.external_id);

                        if (productError) {
                          console.error(productError);
                          toast({ title: "Error", description: "Failed to update product." });
                          return;
                        }

                        // 2️⃣ Update packing_sizes
                        const { error: deleteError } = await supabase
                          .from("packing_sizes")
                          .delete()
                          .eq("product_external_id", editForm.external_id);

                        if (deleteError) {
                          console.error(deleteError);
                          toast({ title: "Error", description: "Failed to update packing sizes." });
                          return;
                        }

                        const sizeInserts = editForm.packing_sizes
                          .filter(size => size.trim() !== "")
                          .map(size => ({
                            product_external_id: editForm.external_id,
                            size
                          }));

                        const { error: insertError } = await supabase
                          .from("packing_sizes")
                          .insert(sizeInserts);

                        if (insertError) {
                          console.error(insertError);
                          toast({ title: "Error", description: "Failed to add packing sizes." });
                          return;
                        }

                        // 3️⃣ Refresh from view
                        const { data: updatedProduct, error: fetchError } = await supabase
                          .from("product_with_sizes")
                          .select("*")
                          .eq("external_id", editForm.external_id)
                          .single();

                        if (fetchError) {
                          console.error(fetchError);
                          toast({ title: "Error", description: "Failed to reload product data." });
                          return;
                        }

                        setProducts(products.map(p =>
                          p.external_id === editForm.external_id ? updatedProduct : p
                        ));
                        setSelectedProduct(updatedProduct);
                        setIsEditing(false);
                        toast({ title: "Product updated", description: "Product details updated successfully." });
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
                          external_id: selectedProduct.external_id,
                          product_name: selectedProduct.product_name,
                          category: selectedProduct.category,
                          sub_category: selectedProduct.sub_category,
                          common_description: selectedProduct.common_description,
                          internal_reference: selectedProduct.internal_reference,
                          sales_description: selectedProduct.sales_description,
                          packing_sizes: [...selectedProduct.packing_sizes],
                          uqc: selectedProduct.uqc
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
                          external_id: selectedProduct.external_id,
                          product_name: selectedProduct.product_name,
                          category: selectedProduct.category,
                          sub_category: selectedProduct.sub_category,
                          common_description: selectedProduct.common_description,
                          internal_reference: selectedProduct.internal_reference,
                          sales_description: selectedProduct.sales_description,
                          packing_sizes: [...selectedProduct.packing_sizes],
                          uqc: selectedProduct.uqc
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit Product
                    </Button>

                    {/* DELETE BUTTON */}
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this product?")) return;

                        // 1️⃣ Delete packing_sizes first
                        const { error: packingError } = await supabase
                          .from("packing_sizes")
                          .delete()
                          .eq("product_external_id", selectedProduct.external_id);

                        if (packingError) {
                          console.error(packingError);
                          toast({ title: "Error", description: "Failed to remove packing sizes." });
                          return;
                        }

                        // 2️⃣ Delete product
                        const { error: productError } = await supabase
                          .from("products")
                          .delete()
                          .eq("external_id", selectedProduct.external_id);

                        if (productError) {
                          console.error(productError);
                          toast({ title: "Error", description: "Failed to delete product." });
                          return;
                        }

                        // 3️⃣ Update local state
                        setProducts(products.filter(p => p.external_id !== selectedProduct.external_id));
                        setShowProductDetails(false);

                        toast({ title: "Deleted", description: "Product deleted successfully." });
                      }}
                    >
                      Delete Product
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

export default ProductsTab;
