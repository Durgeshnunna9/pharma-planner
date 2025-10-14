import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import {
  PackageOpen,
  Factory,
  Monitor,
  BarChart3,
  HomeIcon,
  Smile,
  LogOut,
} from "lucide-react";
import ProductsTab from "@/components/ProductsTab";
import CustomersTab from "@/components/CustomersTab";
import ProductionTab from "@/components/ProductionTab";
import ShopFloorTab from "@/components/ShopFloorTab";
import DashboardTab from "@/components/DashboardTab";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch user + profile
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        setProfile(profileData);
      }

      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;

  // ✅ Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ Tabs with role restrictions
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, component: DashboardTab, roles: ["user", "admin", "manager"] },
    { id: "products", label: "Products", icon: PackageOpen, component: ProductsTab, roles: ["user", "admin" ,"manager"] },
    { id: "customers", label: "Customers", icon: Smile, component: CustomersTab, roles: ["user", "admin", "manager"] },
    { id: "production", label: "Production", icon: Factory, component: ProductionTab, roles: ["admin","manager"] },
    { id: "shopfloor", label: "Shop Floor", icon: Monitor, component: ShopFloorTab, roles: ["admin","production", "manager"] },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(profile?.role));
  const ActiveComponent = visibleTabs.find((tab) => tab.id === activeTab)?.component;
  

  // ✅ Grid columns depend on role
  const gridCols = ['admin', 'manager'].includes(profile?.role) ? "grid-cols-5" : profile?.role === "production" ? "grid-cols-1" : "grid-cols-3"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* ✅ Header with title on left + user info on right */}
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Sansan Groups</h1>

          {profile && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-xl font-bold">
                {profile.full_name} 
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center space-x-2 text-red-500 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-md font-bold ">Sign Out</span>
              </Button>
            </div>
          )}
        </header>

        {/* Tab Navigation */}
        <div className={`flex flex-col items-center mb-8 ${activeTab ? 'top-0 left-0 right-0 z-50 bg-white shadow-lg rounded-xl py-4' : ''}`}>
          <div className={`grid ${gridCols} justify-between items-center gap-6 bg-white p-6 container ${activeTab ? 'container mx-auto' : ''}`}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Card
                  key={tab.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 p-6 text-center min-w-[120px] ${
                    activeTab === tab.id
                      ? "bg-green-500 text-white shadow-xl "
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
                className="cursor-pointer transition-all duration-300 hover:scale-105 p-6 text-center min-w-[120px] bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm"
                onClick={() => setActiveTab("")}
              >
                <HomeIcon className="mx-auto w-18 h-18" />
                <span className="text-lg pb-1">Home</span>
              </Button>
            </div>
          )}
        </div>

        {/* Active Tab Content */}
        {ActiveComponent && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ActiveComponent />
          </div>
        )}

        {/* Welcome Message */}
        {!activeTab && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-center text-xl font-medium text-gray-700">
              Welcome to Sansan Groups
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
