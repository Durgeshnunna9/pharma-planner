import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Search, Building,X, Download, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "../supabaseClient";
// import initialCustomers from "../data/customer.js";
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
  // billing_address: string;
  // shipping_address: string;
}

const CustomersTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sameAsBinding, setSameAsBinding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const { toast } = useToast();
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [gstLocked, setGstLocked] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_code: "",
    company_name: "",
    gstin_number: "",
    customer_name: "",
    dl20b_number: "",
    dl21b_number: "",
    // billing_address: "",
    // shipping_address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_code: '',
    customer_name: '',
    gstin_number: '',
    company_name: '',
    dl20b_number: '',
    dl21b_number: '',
    // billing_address: '',
    // shipping_address: '',
  });
  const [userRole, setRole] = useState<'admin' | 'user' | 'manager' | 'production' | null>(null);

useEffect(() => {
  const fetchRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // look up profile row for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || "user");
    }
  };

  fetchRole();
}, []);

  useEffect(() => {
    const loadCustomers = async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("*");
  
      if (error) {
        console.error("Failed to load customer", error);
      } else {
        setCustomers(data);
      }
    };
  
    loadCustomers();
  }, []);
  // const handleGstinLookup = async () => {
  //   const gstin = newCustomer.gstin_number.trim();
  //   if (!gstin) {
  //     toast({
  //       title: "Error",
  //       description: "Please enter a GSTIN number first.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  
  //   try {
  //     // Replace with your actual GST API endpoint and key
  //     const response = await fetch(`https://your-gst-api.com/gstin/${gstin}`,//Enter your gst number here 
  //       {
  //       headers: {
  //         "Authorization": "Bearer YOUR_API_KEY"
  //       }
  //     });
  //     if (!response.ok) throw new Error("GSTIN not found or API error");
  //     const data = await response.json();
  
  //     // Example: adjust these fields based on your API's response structure
  //     setNewCustomer({
  //       ...newCustomer,
  //       company_name: data.legalName || "",
  //       customer_code: data.code || "",
  //       dl20b_number: data.dl20b_number || "",
  //       dl21b_number: data.dl21b_number || "",
  //       billing_address: data.address || "",
  //       shipping_address: data.address || "",
  //       // Add more fields as needed. These will depend on what json data is been recieved from gst portal.
  //     });
  //     setGstLocked(true);
  //     toast({
  //       title: "GSTIN Data Fetched",
  //       description: "Company details have been filled from GSTIN.",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "GSTIN Lookup Failed",
  //       description: error.message || "Could not fetch GSTIN details.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleAddCustomer = async () => {
    if (!newCustomer.company_name || !newCustomer.customer_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
  
    // Step 1: Check for duplicate in Supabase
    const { data: existingCustomer, error: searchError } = await supabase
      .from("customer")
      .select("customer_code")
      .ilike("company_name", `%${newCustomer.company_name.trim()}%`); // case-insensitive search
  
    if (searchError) {
      console.error("Search failed", searchError);
      toast({
        title: "Error",
        description: "Could not check existing customers",
        variant: "destructive",
      });
      return;
    }
  
    if (existingCustomer && existingCustomer.length > 0) {
      toast({
        title: "Duplicate",
        description: "Customer already exists in the database",
        variant: "destructive",
      });
      return;
    }
  
    // Step 2: Insert new customer
    const { data, error } = await supabase
      .from("customer")
      .insert([newCustomer])
      .select();
  
    if (error) {
      // Handle unique constraint violation just in case
      if (error.code === "23505") {
        toast({
          title: "Duplicate",
          description: "Customer already exists",
          variant: "destructive",
        });
      } else {
        console.error("Failed to add customer", error);
        toast({
          title: "Error",
          description: "Something went wrong while adding customer",
          variant: "destructive",
        });
      }
      return;
    }
  
    // Step 3: Update local state
    setCustomers([...customers, data[0]]);
    setNewCustomer({
      customer_code: "",
      customer_name: "",
      company_name: "",
      gstin_number: "",
      dl20b_number: "",
      dl21b_number: "",
      // billing_address: "",
      // shipping_address: "",
    });
    setShowAddForm(false);
  
    // Step 4: Show success
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };
  

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };
  // const handleDownloadCustomers = () => {
  //   // Prepare data for export (flatten arrays, etc.)
  //   const exportData = customers.map(customer => ({
  //     "Customer Code": customer.customer_code,
  //     "Customer Name": customer.customer_name,
  //     "GSTIN Number": customer.gstin_number,
  //     "Company Name": customer.company_name,
  //     "20B DL Number": customer.dl20b_number,
  //     "21B DL Number": customer.dl21b_number,
  //     "Billing Address": customer.billing_address,
  //     "Shipping Address": customer.shipping_address,
  //   }));
  
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  
  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "customers.xlsx");
  // };
  // const handleImportCustomers = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  //     // Map the imported data to your customer structure
  //     const importedCustomers = jsonData.map((row: any, idx: number) => ({
  //       customer_code: row["Customer Code"] || `imported-${idx}`,
  //       customer_name: row["Customer Name"] || "",
  //       gstin_number: row["GSTIN Number"] || "",
  //       company_name: row["Company Name"] || "",
  //       dl20b_number: row["20B DL Number"] || "",
  //       dl21b_number: row["21B DL Number"] || "",
  //       billing_address: row["Billing Address"] || "",
  //       shipping_address: row["Shipping Address"] || "",
  //     }));
  
  //     setCustomers([...customers, ...importedCustomers]);
  //     toast({
  //       title: "Import Successful",
  //       description: `${importedCustomers.length} customers imported.`,
  //     });
  
  //     // Clear file input
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //   };
  //   reader.readAsArrayBuffer(file);
  // };

  const filteredCustomers = customers.filter(customer =>
    (customer.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.customer_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.gstin_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customers Management</h2>
        <div className="flex gap-3">
        {/* <input
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
          </Button> */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 ${['admin', 'manager'].includes(userRole) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
            disabled={!['admin', 'manager'].includes(userRole)}
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
          className="pl-8"
        />
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Add New Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstinNumber">GSTIN Number</Label>
                <Input
                  id="gstinNumber"
                  value={newCustomer.gstin_number}
                  onChange={(e) => setNewCustomer({...newCustomer, gstin_number: e.target.value})}
                  placeholder="Enter GSTIN"
                />
              </div>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newCustomer.customer_name}
                  onChange={(e) => setNewCustomer({...newCustomer, customer_name: e.target.value})}
                  placeholder="Enter customer name"
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
                value={newCustomer.billing_address}
                onChange={(e) => setNewCustomer({...newCustomer, billing_address: e.target.value})}
                placeholder="Enter billing address"
              />
            </div>

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
            )} */}

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
                <div className="flex items-center gap-4">
                  <div className="mt-3 p-3 bg-gray-100 rounded-xl">
                    <Building2 className="w-6 h-9"/>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2">
                      <p>Customer Name: <span className="text-lg font-semibold text-gray-900">{customer.customer_name ?.trim() || "NaN" }</span></p>
                      <p>Company Name: <span className="text-lg font-semibold text-gray-900">{customer.company_name?.trim() || "NaN" }</span></p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1"><span className="text-base font-bold">Code: </span> {customer.customer_code}</p>
                        <p className="font-medium text-gray-700"> <span className="text-base font-bold">GSTIN:</span> {customer.gstin_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1"> <span className="text-base font-bold">20B DL:</span> {customer.dl20b_number?.trim() || "NaN"}</p>
                        <p className="text-gray-600"><span className="text-base font-bold">21B DL:</span> {customer.dl21b_number?.trim() || "NaN"}</p>
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
              <h3 className="text-lg font-bold">CUSTOMER DETAILS</h3>
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 ">
                {/* Customer Header */}
                <h2 className="text-xl font-bold text-gray-900 mb-2 mr-4">
                  {isEditing ? (
                    <div>
                      <p className="text-sm pb-1">Company Name:</p>
                      <Input
                        value={editForm.company_name}
                        className="font-normal"
                        onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                      />
                    </div>
                  ) : (
                    <p className="font-normal text-sm"><span className="text-base font-bold">Company Name:</span> {selectedCustomer.company_name}</p>
                  )}
               </h2>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <div >
                      <p className="text-sm pb-1">Customer Name:</p>
                      <Input
                        value={editForm.customer_name}
                        className="font-normal"
                        onChange={e => setEditForm({ ...editForm, customer_name: e.target.value })}
                      />
                    </div>
                    
                  ) : (
                    <p className="font-normal text-sm"><span className="text-base font-bold">Customer Name:</span> {selectedCustomer.customer_name}</p>
                  )}
                </h2>
                <div className="mt-3">
                  <div className="flex flex-col gap-3">
                    {/* Code Badge */}
                    <div className="p-2">
                      <span className="px-3 py-1 rounded-full  pt-3 pb-3 mt-2 text-xs font-medium bg-green-100 text-green-800">
                        Code:{" "}
                        {isEditing ? (
                          <Input
                            value={editForm.customer_code}
                            onChange={e => setEditForm({ ...editForm, customer_code: e.target.value })}
                            className="w-40 inline-block h-auto p-1"
                          />
                        ) : (
                          selectedCustomer.customer_code
                        )}
                      </span>
                    </div>

                    {/* GSTIN Badge */}
                    <div>
                      <span className="px-3 py-1 p-2 rounded-full pt-3 pb-3 text-xs font-medium bg-blue-100 text-blue-800">
                        GSTIN:{" "}
                        {isEditing ? (
                          <Input
                            value={editForm.gstin_number || ""}
                            onChange={e => setEditForm({ ...editForm, gstin_number: e.target.value })}
                            className="w-40 inline-block h-auto p-1"
                            placeholder="Enter GSTIN"
                          />
                        ) : (
                          selectedCustomer.gstin_number || "Not Provided"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* License Numbers & Addresses */}
                <div className="gap-6">
                  <div>
                    <p className="text-base font-bold text-gray-900 mb-2">License Information</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 ">20B DL No:</span>
                        {isEditing ? (
                          <Input
                            value={editForm.dl20b_number}
                            onChange={e => setEditForm({ ...editForm, dl20b_number: e.target.value })}
                            className="w-40 inline-block h-auto"
                          />
                        ) : (
                          <span className="font-medium">{selectedCustomer.dl20b_number || "N/A"}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800">201B DL No:</span>
                        {isEditing ? (
                          <Input
                            value={editForm.dl21b_number}
                            onChange={e => setEditForm({ ...editForm, dl21b_number: e.target.value })}
                            className="w-40 inline-block h-auto"
                          />
                        ) : (
                          <span className="font-medium">{selectedCustomer.dl21b_number || "N/A"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* <div>
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
                  </div> */}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isEditing ? (
                  <div >
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick= {async () => {
                        const { error: customerError } = await supabase
                          .from("customer")
                          .update({
                            company_name: editForm.company_name,
                            customer_code: editForm.customer_code,
                            gstin_number: editForm.gstin_number,
                            dl20b_number: editForm.dl20b_number,
                            dl21b_number: editForm.dl21b_number,
                            // billing_address: editForm.billing_address,
                            // shipping_address: editForm.shipping_address,
                          })
                          .eq("customer_code", selectedCustomer.customer_code)
                        if(customerError){
                          console.error(customerError);
                          toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
                          return;
                        }
                        
                        const { data: updatedCustomer, error: fetchError } = await supabase
                          .from("customer")
                          .select("*")
                          .eq("customer_code", editForm.customer_code)
                          .single();

                        if (fetchError) {
                          console.error(fetchError);
                          toast({ title: "Error", description: "Failed to reload customer data." });
                          return;
                        }
                        setCustomers(customers.map(c =>
                          c.customer_code === editForm.customer_code ? updatedCustomer : c
                        ));
                        setSelectedCustomer(updatedCustomer);
                        setIsEditing(false);
                        toast({ title: "Customer updated", description: "Customer details updated successfully." });
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="outline" className="ml-2" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${['admin', 'manager'].includes(userRole) ? '' : 'bg-gray-300 cursor-not-allowed'}`}
                      disabled={!['admin', 'manager'].includes(userRole)}
                      onClick={() => {
                        setEditForm({
                          customer_code: selectedCustomer.customer_code,
                          customer_name: selectedCustomer.customer_name,
                          gstin_number: selectedCustomer.gstin_number,
                          company_name: selectedCustomer.company_name,
                          dl20b_number: selectedCustomer.dl20b_number,
                          dl21b_number: selectedCustomer.dl21b_number,
                          // billing_address: selectedCustomer.billing_address,
                          // shipping_address: selectedCustomer.shipping_address,
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit Customer
                    </Button>
                    {/* DELETE BUTTON */}
                    <Button
                      className={`flex items-center gap-2 ${['admin', 'manager'].includes(userRole) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed' }`}
                      disabled={!['admin', 'manager'].includes(userRole)}
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this customer?")) return;

                        // Delete customer
                        const { error } = await supabase
                          .from("customer")
                          .delete()
                          .eq("customer_code", selectedCustomer.customer_code);

                        if (error) {
                          console.error(error);
                          toast({ title: "Error", description: "Failed to delete customer." });
                          return;
                        }

                        // Update local state
                        setCustomers(customers.filter(p => p.customer_code !== selectedCustomer.customer_code));
                        setShowCustomerDetails(false);
                        toast({ title: "Deleted", description: "customer deleted successfully." });
                      }}
                    >
                      Delete Customer
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

export default CustomersTab;


