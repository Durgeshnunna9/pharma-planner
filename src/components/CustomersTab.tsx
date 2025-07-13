
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Search, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  companyName: string;
  customerCode: string;
  gstinNumber: string;
  dl20B: string;
  dl201B: string;
  billingAddress: string;
  shippingAddress: string;
}

const CustomersTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sameAsBinding, setSameAsBinding] = useState(false);
  const { toast } = useToast();

  const [newCustomer, setNewCustomer] = useState({
    companyName: "",
    customerCode: "",
    gstinNumber: "",
    dl20B: "",
    dl201B: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const handleAddCustomer = () => {
    if (!newCustomer.companyName || !newCustomer.customerCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      ...newCustomer,
      shippingAddress: sameAsBinding ? newCustomer.billingAddress : newCustomer.shippingAddress,
    };

    setCustomers([...customers, customer]);
    setNewCustomer({
      companyName: "",
      customerCode: "",
      gstinNumber: "",
      dl20B: "",
      dl201B: "",
      billingAddress: "",
      shippingAddress: "",
    });
    setSameAsBinding(false);
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customers Management</h2>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="customerCode">Customer Code *</Label>
                <Input
                  id="customerCode"
                  value={newCustomer.customerCode}
                  onChange={(e) => setNewCustomer({...newCustomer, customerCode: e.target.value})}
                  placeholder="Enter customer code"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gstinNumber">GSTIN Number</Label>
                <Input
                  id="gstinNumber"
                  value={newCustomer.gstinNumber}
                  onChange={(e) => setNewCustomer({...newCustomer, gstinNumber: e.target.value})}
                  placeholder="Enter GSTIN"
                />
              </div>
              <div>
                <Label htmlFor="dl20B">20B DL Number</Label>
                <Input
                  id="dl20B"
                  value={newCustomer.dl20B}
                  onChange={(e) => setNewCustomer({...newCustomer, dl20B: e.target.value})}
                  placeholder="Enter 20B DL number"
                />
              </div>
              <div>
                <Label htmlFor="dl201B">201B DL Number</Label>
                <Input
                  id="dl201B"
                  value={newCustomer.dl201B}
                  onChange={(e) => setNewCustomer({...newCustomer, dl201B: e.target.value})}
                  placeholder="Enter 201B DL number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={newCustomer.billingAddress}
                onChange={(e) => setNewCustomer({...newCustomer, billingAddress: e.target.value})}
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
                  value={newCustomer.shippingAddress}
                  onChange={(e) => setNewCustomer({...newCustomer, shippingAddress: e.target.value})}
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
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.companyName}</h3>
                    <p className="text-sm text-gray-600 mb-2">Code: {customer.customerCode}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">GSTIN: {customer.gstinNumber}</p>
                        <p className="text-gray-600">20B DL: {customer.dl20B}</p>
                        <p className="text-gray-600">201B DL: {customer.dl201B}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Billing Address:</p>
                        <p className="text-gray-600 text-xs">{customer.billingAddress}</p>
                        {customer.shippingAddress !== customer.billingAddress && (
                          <>
                            <p className="font-medium text-gray-700 mt-2">Shipping Address:</p>
                            <p className="text-gray-600 text-xs">{customer.shippingAddress}</p>
                          </>
                        )}
                      </div>
                    </div>
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

export default CustomersTab;
