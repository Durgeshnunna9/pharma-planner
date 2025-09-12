import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  PackageOpen ,
  ContactRound ,
  Boxes,
  Factory,
  Monitor,
  BarChart3,
  HomeIcon,
  IdCard ,
  IdCardLanyard ,
  Smile ,
  ShieldUser,
} from "lucide-react";
import ProductsTab from "@/components/ProductsTab";
import CustomersTab from "@/components/CustomersTab";
import ProductionTab from "@/components/ProductionTab";
import ShopFloorTab from "@/components/ShopFloorTab";
import DashboardTab from "@/components/DashboardTab";
// import UsersTab from "@/components/UsersTab";
import { Button } from "@/components/ui/button";
import prodImg from "../components/assests/robotic-arm.png"

const Index = () => {
  const [activeTab, setActiveTab] = useState("");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, component: DashboardTab },
    { id: "products", label: "Products", icon: PackageOpen , component: ProductsTab },
    { id: "customers", label: "Customers", icon: Smile , component: CustomersTab },
    { id: "production", label: "Production", icon: Factory, component: ProductionTab },
    { id: "shopfloor", label: "Shop Floor", icon: Monitor, component: ShopFloorTab },
    // { id: "users", label: "Users", icon: IdCardLanyard  , component: UsersTab },
    
    
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
        <div className={`flex flex-col items-center mb-8 ${activeTab ? 'fixed top-0 left-0 right-0 z-50 bg-white shadow-lg py-4' : ''}`}>
          {/* Tabs */}
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
                  <Icon className="mx-auto mb-3 w-12 h-12" />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </Card>
              );
            })}
          </div>

          {/* Home Button */}
          {activeTab && (
            <div className="mt-4">
              <Button
                className="cursor-pointer transition-all duration-300 hover:scale-105 p-6 text-center min-w-[120px] bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm "
                onClick={() => setActiveTab("")}
              >
                <HomeIcon className="mx-auto  w-18 h-18" />
                <span className=" text-lg pb-1">Home</span>
              </Button>
            </div>
          )}
        </div>


        
        {/* Active Tab Content */}
        {ActiveComponent && (
          <div className={`bg-white rounded-2xl shadow-lg p-8 ${activeTab ? 'mt-60' : ''}`}>
            <ActiveComponent />
          </div>
        )}

        {/* Welcome Message */}
        {!activeTab && (
          <div className={`bg-white rounded-2xl shadow-lg p-8`}>
            <h2 className="text-center text-xl font-medium text-gray-700">Welcome to Sansan Groups</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;