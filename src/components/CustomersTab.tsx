import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Search, Building, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import initialCustomers from "../data/customer.js";
import { useRef } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Customer {
  id: string;
  customer_code: string;
  customer_name: string;
  gstin_number: string;
  company_name: string;
  dl20b_number: string;
  dl21b_number: string;
  billing_address: string;
  shipping_address: string;
}

const CustomersTab = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sameAsBinding, setSameAsBinding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gstLocked, setGstLocked] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_code: "",
    company_name: "",
    gstin_number: "",
    customer_name: "",
    dl20b_number: "",
    dl21b_number: "",
    billing_address: "",
    shipping_address: "",
  });
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

  const handleGstinLookup = async () => {
    const gstin = newCustomer.gstin_number.trim();
    if (!gstin) {
      toast({
        title: "Error",
        description: "Please enter a GSTIN number first.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // Replace with your actual GST API endpoint and key
      const response = await fetch(`https://your-gst-api.com/gstin/${gstin}`,//Enter your gst number here 
        {
        headers: {
          "Authorization": "Bearer YOUR_API_KEY"
        }
      });
      if (!response.ok) throw new Error("GSTIN not found or API error");
      const data = await response.json();
  
      // Example: adjust these fields based on your API's response structure
      setNewCustomer({
        ...newCustomer,
        company_name: data.legalName || "",
        customer_code: data.code || "",
        dl20b_number: data.dl20b_number || "",
        dl21b_number: data.dl21b_number || "",
        billing_address: data.address || "",
        shipping_address: data.address || "",
        // Add more fields as needed. These will depend on what json data is been recieved from gst portal.
      });
      setGstLocked(true);
      toast({
        title: "GSTIN Data Fetched",
        description: "Company details have been filled from GSTIN.",
      });
    } catch (error) {
      toast({
        title: "GSTIN Lookup Failed",
        description: error.message || "Could not fetch GSTIN details.",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.company_name || !newCustomer.customer_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const customer = {
      id: Date.now().toString(),
      customer_code: newCustomer.customer_code,
      customer_name: newCustomer.customer_name,
      gstin_number: newCustomer.gstin_number,
      company_name: newCustomer.company_name,
      dl20b_number: newCustomer.dl20b_number,
      dl21b_number: newCustomer.dl21b_number,
      billing_address: newCustomer.billing_address,
      shipping_address: newCustomer.shipping_address,
    };

    setCustomers([...customers, customer]);
    setNewCustomer({
      customer_code: "",
      customer_name: "",
      company_name: "",
      gstin_number: "",
      dl20b_number: "",
      dl21b_number: "",
      billing_address: "",
      shipping_address: "",
    });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };
  const handleDownloadCustomers = () => {
    // Prepare data for export (flatten arrays, etc.)
    const exportData = customers.map(customer => ({
      "Customer Code": customer.customer_code,
      "Customer Name": customer.customer_name,
      "GSTIN Number": customer.gstin_number,
      "Company Name": customer.company_name,
      "20B DL Number": customer.dl20b_number,
      "21B DL Number": customer.dl21b_number,
      "Billing Address": customer.billing_address,
      "Shipping Address": customer.shipping_address,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "customers.xlsx");
  };
  const handleImportCustomers = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
      // Map the imported data to your customer structure
      const importedCustomers = jsonData.map((row: any, idx: number) => ({
        customer_code: row["Customer Code"] || `imported-${idx}`,
        customer_name: row["Customer Name"] || "",
        gstin_number: row["GSTIN Number"] || "",
        company_name: row["Company Name"] || "",
        dl20b_number: row["20B DL Number"] || "",
        dl21b_number: row["21B DL Number"] || "",
        billing_address: row["Billing Address"] || "",
        shipping_address: row["Shipping Address"] || "",
      }));
  
      setCustomers([...customers, ...importedCustomers]);
      toast({
        title: "Import Successful",
        description: `${importedCustomers.length} customers imported.`,
      });
  
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.customer_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customers Management</h2>
        <div className="flex gap-3">
        <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportCustomers}
          />
          <Button
            variant="outline"
            onClick={handleDownloadCustomers}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Customer Data
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
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search customers by company name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Add New Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="gstinNumber">GSTIN Number</Label>
            <div className="grid grid-cols-3 gap-4">
                <Input
                  id="gstinNumber"
                  value={newCustomer.gstin_number}
                  onChange={(e) => setNewCustomer({...newCustomer, gstin_number: e.target.value})}
                  placeholder="Enter GSTIN"
                />
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-12 h-10" type="button" onClick={handleGstinLookup}>
                  <Search className="w-4 h-4" />
                </button>
                <Button
                  type="button"
                  onClick={() => setGstLocked(false)}
                  className="ml-2 bg-violet-900 hover:bg-purple-400 text-white px-4 py-2 rounded-md w-15 h-10"
                >
                  Edit Fields
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={newCustomer.company_name}
                  onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                  placeholder="Enter company name"
                  readOnly={gstLocked}
                />
              </div>
              <div>
                <Label htmlFor="customerCode">Customer Code *</Label>
                <Input
                  id="customerCode"
                  value={newCustomer.customer_code}
                  onChange={(e) => setNewCustomer({...newCustomer, customer_code: e.target.value})}
                  placeholder="Enter customer code"
                  readOnly={gstLocked}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dl20B">20B DL Number</Label>
                <Input
                  id="dl20B"
                  value={newCustomer.dl20b_number}
                  onChange={(e) => setNewCustomer({...newCustomer, dl20b_number: e.target.value})}
                  placeholder="Enter 20B DL number"
                  readOnly={gstLocked}
                />
              </div>
              <div>
                <Label htmlFor="dl21B">21B DL Number</Label>
                <Input
                  id="dl21B"
                  value={newCustomer.dl21b_number}
                  onChange={(e) => setNewCustomer({...newCustomer, dl21b_number: e.target.value})}
                  placeholder="Enter 21B DL Number"
                  readOnly={gstLocked}
                />
              </div>
            </div>

            {/* <div>
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={newCustomer.billingAddress}
                onChange={(e) => setNewCustomer({...newCustomer, billingAddress: e.target.value})}
                placeholder="Enter billing address"
              />
            </div> */}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsBinding"
                checked={sameAsBinding}
                onCheckedChange={(checked) => setSameAsBinding(checked as boolean)}
              />
              <Label htmlFor="sameAsBinding">Shipping address same as billing address</Label>
            </div>

            {!sameAsBinding && (
              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  value={newCustomer.shipping_address}
                  onChange={(e) => setNewCustomer({...newCustomer, shipping_address: e.target.value})}
                  placeholder="Enter shipping address"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleAddCustomer} className="bg-green-500 hover:bg-green-600">
                Add Customer
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No customers found. Add your first customer to get started.</p>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCustomerClick(customer)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.company_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Code: {customer.customer_code}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div style={{marginTop:10}}>
                        <p className="font-medium text-gray-700">GSTIN: {customer.gstin_number}</p>
                        
                      </div>
                      {/* <div>
                        <p className="font-medium text-gray-700">Billing Address:</p>
                        <p className="text-gray-600 text-xs">{customer.billingAddress}</p>
                        {customer.shippingAddress !== customer.billingAddress && (
                          <>
                            <p className="font-medium text-gray-700 mt-2">Shipping Address:</p>
                            <p className="text-gray-600 text-xs">{customer.shippingAddress}</p>
                          </>
                        )}
                      </div> */}
                      <div>
                      <p className="text-gray-600">20B DL: {customer.dl20b_number}</p>
                      <p className="text-gray-600">21B DL: {customer.dl21b_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Customer Details</span>
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomerDetails(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button> */}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <Input
                      value={editForm.company_name}
                      onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                    />
                  ) : (
                    selectedCustomer.company_name
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Code: {isEditing ? (
                      <Input
                        value={editForm.customer_code}
                        onChange={e => setEditForm({ ...editForm, customer_code: e.target.value })}
                        className="w-32 inline-block"
                      />
                    ) : (
                      selectedCustomer.customer_code
                    )}
                  </span>
                  {(isEditing ? editForm.gstin_number : selectedCustomer.gstin_number) && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      GSTIN: {isEditing ? (
                        <Input
                          value={editForm.gstin_number}
                          onChange={e => setEditForm({ ...editForm, gstin_number: e.target.value })}
                          className="w-40 inline-block"
                        />
                      ) : (
                        selectedCustomer.gstin_number
                      )}
                    </span>
                  )}
                </div>
              </div>
              {/* License Numbers & Addresses */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">License Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">20B DL No:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.dl20b_number}
                          onChange={e => setEditForm({ ...editForm, dl20b_number: e.target.value })}
                          className="w-32 inline-block"
                        />
                      ) : (
                        <span className="font-medium">{selectedCustomer.dl20b_number || "N/A"}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">201B DL No:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.dl21b_number}
                          onChange={e => setEditForm({ ...editForm, dl21b_number: e.target.value })}
                          className="w-32 inline-block"
                        />
                      ) : (
                        <span className="font-medium">{selectedCustomer.dl21b_number || "N/A"}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Addresses</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Billing Address:</span>
                      {isEditing ? (
                        <Textarea
                          value={editForm.billing_address}
                          onChange={e => setEditForm({ ...editForm, billing_address: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-700">{selectedCustomer.billing_address || "N/A"}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Shipping Address:</span>
                      {isEditing ? (
                        <Textarea
                          value={editForm.shipping_address}
                          onChange={e => setEditForm({ ...editForm, shipping_address: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-700">{selectedCustomer.shipping_address || "N/A"}</div>
                      )}
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
                        setCustomers(customers.map(c =>
                          c.id === selectedCustomer.id ? { ...c, ...editForm } : c
                        ));
                        setSelectedCustomer({ ...selectedCustomer, ...editForm });
                        setIsEditing(false);
                        toast({ title: "Customer updated", description: "Customer details updated successfully." });
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
                        customer_code: selectedCustomer.customer_code,
                        customer_name: selectedCustomer.customer_name,
                        gstin_number: selectedCustomer.gstin_number,
                        company_name: selectedCustomer.company_name,
                        dl20b_number: selectedCustomer.dl20b_number,
                        dl21b_number: selectedCustomer.dl21b_number,
                        billing_address: selectedCustomer.billing_address,
                        shipping_address: selectedCustomer.shipping_address,
                      });
                      setIsEditing(true);
                    }}
                  >
                    Edit Customer
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

export default CustomersTab;


