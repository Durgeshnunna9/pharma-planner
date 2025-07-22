import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Upload, Search, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
// import initialProducts from "../data/product.js";
import { saveAs } from 'file-saver';
import { useRef } from "react";

interface Product {
  external_id: string;
  product_name: string;
  sales_description: string;
  packing_sizes: string[];
  category: "Human" | "Veterinary";
  internal_reference: string;
  uqc: string;
}

const ProductsTab = () => {
  const [products, setProducts] = useState([]));
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    description: "",
    packingSizes: [""],
    category: "Human" as "Human" | "Veterinary",
    hsnCode: "",
    taxPercentage: 0,
    primaryUnit: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    product_name: '',
    sales_description: '',
    packing_sizes: [''],
    category: 'Human' as 'Human' | 'Veterinary',
    internal_reference: '',
    uqc: '',
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleAddProduct = () => {
    if (!newProduct.productName || !newProduct.description || !newProduct.packingSizes || !newProduct.category || !newProduct.hsnCode || !newProduct.taxPercentage || !newProduct.primaryUnit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product = {
      external_id: Date.now().toString(),
      product_name: newProduct.productName,
      sales_description: newProduct.description,
      packing_sizes: newProduct.packingSizes.filter(s => s.trim()!== ""),
      category: newProduct.category,
      hsnCode: newProduct.hsnCode,
      taxPercentage: newProduct.taxPercentage,
      brandNames: [],
    };
    
    setProducts([...products, product]);
    setNewProduct({
      productName: "",
      description: "",
      packingSizes: [""],
      category: "Human",
      hsnCode: "",
      taxPercentage: 0,
      primaryUnit: "",
    });
    setShowAddForm(false);

    toast({
      title: "Success",
      description: "Product added successfully",
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };
  const handleDownloadProducts = () => {
    // Prepare data for export (flatten arrays, etc.)
    const exportData = products.map(product => ({
      "External ID": product.external_id,
      "Product Name": product.product_name,
      "Category": product.category,
      "Internal Reference": product.internal_reference,
      "Description": product.sales_description,
      "Packing Sizes": product.packing_sizes.join(", "),
      "UQC": product.uqc,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "products.xlsx");
  };
  const handleImportProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (!result || typeof result === "string") {
        toast({
          title: "Import Failed",
          description: "Invalid file format.",
          variant: "destructive",
        });
        return;
      }
      const data = new Uint8Array(result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      // Map the imported data to your product structure
      const importedProducts = jsonData.map((row: any, idx: number) => ({
        external_id: row["External ID"] || `imported-${idx}`,
        product_name: row["Product Name"] || "",
        sales_description: row["Description"] || "",
        packing_sizes: typeof row["Packing Sizes"] === "string" ? row["Packing Sizes"].split(",").map((s: string) => s.trim()) : [],
        category: row["Category"] === "Veterinary" ? "Veterinary" : "Human",
        internal_reference: row["Internal Reference"] || "",
        uqc: row["UQC"] || "",
      }));
  
      setProducts([...products, ...importedProducts]);
      toast({
        title: "Import Successful",
        description: `${importedProducts.length} products imported.`,
      });
  
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };
  
  const filteredProducts = products.filter(product =>
    (categoryFilter !== "all" ? product.category === categoryFilter : true) &&
    (
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sales_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.internal_reference.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <div className="flex gap-3">
        <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportProducts}
          />
          <Button
            variant="outline"
            onClick={handleDownloadProducts}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Product Data
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
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
            </div>

            <div>
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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
              <Label htmlFor="primaryUnit">Primary Unit</Label>
              <Input
                id="primaryUnit"
                value={newProduct.primaryUnit}
                onChange={e => setNewProduct({ ...newProduct, primaryUnit: e.target.value })}
                placeholder="ml, tablets, etc."
              />
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
          value={categoryFilter}
          onValueChange={value => setCategoryFilter(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Human">Human</SelectItem>
            <SelectItem value="Veterinary">Veterinary</SelectItem>
          </SelectContent>
        </Select>
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
                    <p className="text-gray-600 mt-1">{product.sales_description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.category === "Human"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>{product.category}</span>
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
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductDetails(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button> */}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <Input
                      value={editForm.product_name}
                      onChange={e => setEditForm({ ...editForm, product_name: e.target.value })}
                    />
                  ) : (
                    selectedProduct.product_name
                  )}
                </h2>
                <div className="flex items-center gap-3">
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
                  <span className="text-sm text-gray-500">
                    ID: {selectedProduct.external_id}
                  </span>
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
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        // Save changes
                        setProducts(products.map(p =>
                          p.external_id === selectedProduct.external_id ? { ...p, ...editForm } : p
                        ));
                        setSelectedProduct({ ...selectedProduct, ...editForm });
                        setIsEditing(false);
                        toast({ title: "Product updated", description: "Product details updated successfully." });
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditForm({
                        product_name: selectedProduct.product_name,
                        sales_description: selectedProduct.sales_description,
                        packing_sizes: [...selectedProduct.packing_sizes],
                        category: selectedProduct.category,
                        internal_reference: selectedProduct.internal_reference,
                        uqc: selectedProduct.uqc,
                      });
                      setIsEditing(true);
                    }}
                  >
                    Edit Product
                  </Button>
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
