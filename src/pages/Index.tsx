
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, Users, Factory, Monitor, BarChart3 } from "lucide-react";
import ProductsTab from "@/components/ProductsTab";
import CustomersTab from "@/components/CustomersTab";
import ProductionTab from "@/components/ProductionTab";
import ShopFloorTab from "@/components/ShopFloorTab";
import DashboardTab from "@/components/DashboardTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, component: DashboardTab },
    { id: "products", label: "Products", icon: Package, component: ProductsTab },
    { id: "customers", label: "Customers", icon: Users, component: CustomersTab },
    { id: "production", label: "Production", icon: Factory, component: ProductionTab },
    { id: "shopfloor", label: "Shop Floor", icon: Monitor, component: ShopFloorTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sansan Groups
          </h1>
        </header>

        {/* Tab Navigation - Dynamic positioning */}
        <div className={`flex justify-center mb-8 ${activeTab ? 'fixed top-0 left-0 right-0 z-50 bg-white shadow-lg py-4' : ''}`}>
          <div className={`grid grid-cols-5 gap-6 bg-white rounded-2xl p-6 shadow-lg ${activeTab ? 'container mx-auto' : ''}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Card
                  key={tab.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 p-6 text-center min-w-[120px] ${
                    activeTab === tab.id
                      ? "bg-green-500 text-white shadow-xl"
                      : "bg-white text-gray-700 hover:bg-green-50"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className={`mx-auto mb-3 ${activeTab ? 'w-8 h-8' : 'w-12 h-12'}`} />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        {ActiveComponent && (
          <div className={`bg-white rounded-2xl shadow-lg p-8 ${activeTab ? 'mt-32' : ''}`}>
            <ActiveComponent />
          </div>
        )}

        {/* Welcome Message when no tab is selected */}
        {!activeTab && (
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Sansan Groups Production Planning System
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Pharma Contract Manufacturing Management
              </p>
              <p className="text-gray-500">
                Select a tab above to get started with managing your production workflow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
