import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Upload, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import initialProducts from "../data/product.js";

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
  const [products, setProducts] = useState(initialProducts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    genericName: "",
    description: "",
    packingSizes: "",
    category: "Human" as "Human" | "Veterinary",
    hsnCode: "",
    taxPercentage: 0,
    primaryUnit: "",
  });

  const handleAddProduct = () => {
    if (!newProduct.genericName || !newProduct.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product = {
      id: Date.now().toString(),
      genericName: newProduct.genericName,
      description: newProduct.description,
      packingSizes: newProduct.packingSizes.split(",").map(size => size.trim()),
      category: newProduct.category,
      hsnCode: newProduct.hsnCode,
      taxPercentage: newProduct.taxPercentage,
      primaryUnit: newProduct.primaryUnit,
      brandNames: [],
    };
    
    setProducts([...products, product]);
    setNewProduct({
      genericName: "",
      description: "",
      packingSizes: "",
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

  const filteredProducts = products.filter(product =>
    // product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // product.description.toLowerCase().includes(searchTerm.toLowerCase())
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.sales_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => toast({ title: "Feature Coming Soon", description: "Excel import will be available soon" })}
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
                <Label htmlFor="genericName">Generic Name *</Label>
                <Input
                  id="genericName"
                  value={newProduct.genericName}
                  onChange={(e) => setNewProduct({...newProduct, genericName: e.target.value})}
                  placeholder="Enter generic name"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packingSizes">Packing Sizes (comma separated)</Label>
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
                      }`}>
                        {product.category}
                      </span>
                      {product.packing_sizes.map((size, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductDetails(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedProduct.product_name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.category === "Human" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {selectedProduct.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {selectedProduct.external_id}
                  </span>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProduct.sales_description}
                </p>
              </div>

              {/* Packing Sizes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Packing Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.packing_sizes.map((size, index) => (
                    <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reference Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internal Reference:</span>
                      <span className="font-medium">{selectedProduct.internal_reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">External ID:</span>
                      <span className="font-medium">{selectedProduct.external_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">UQC:</span>
                      <span className="font-medium">{selectedProduct.uqc || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Category</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Packing Options:</span>
                      <span className="font-medium">{selectedProduct.packing_sizes.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    // Add to production order logic here
                    toast({
                      title: "Feature Coming Soon",
                      description: "Add to production order functionality will be available soon",
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Add to Production Order
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Edit product logic here
                    toast({
                      title: "Feature Coming Soon", 
                      description: "Edit product functionality will be available soon",
                    });
                  }}
                >
                  Edit Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsTab;
