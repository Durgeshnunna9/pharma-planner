import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";
import Logo from "../media/globe.png";
import FullName from "../media/fORMULATIONS.png"
import { motion, AnimatePresence } from "framer-motion";
import {
  PackageOpen,
  Factory,
  Monitor,
  BarChart3,
  Smile,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ Tabs by role
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, component: DashboardTab, roles: ["admin", "production", "manager", "qc", "store"] },
    { id: "products", label: "Products", icon: PackageOpen, component: ProductsTab, roles: ["admin", "production", "manager", "qc", "store"] },
    { id: "customers", label: "Customers", icon: Smile, component: CustomersTab, roles: ["admin", "production", "manager", "qc","store"] },
    { id: "production", label: "Production", icon: Factory, component: ProductionTab, roles: ["admin", "production", "manager", "qc", "store"] },
    { id: "shopfloor", label: "Shop Floor", icon: Monitor, component: ShopFloorTab, roles: ["admin", "production", "manager", "qc", "store"] },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(profile?.role));
  const ActiveComponent = visibleTabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex overflow-hidden relative">
      {/* ✅ Sidebar */}
      <motion.div
        initial={{ width: 78 }}
        animate={{
          width: sidebarOpen ? 220 : 82,
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="h-screen bg-white border-r shadow-md flex flex-col justify-between fixed left-0 top-0 z-50 overflow-hidden"
      >
        {/* Top section */}
        <div>
          <div className={`flex items-center justify-between ${!sidebarOpen ? "flex-row" : "flex-col"} p-4 border-b`}>
            <div className="flex items-center m-0 pr-0">
            {!sidebarOpen?<img src={Logo} alt="Company Logo" className="w-7 h-6"/>:<span></span>}
              {sidebarOpen && (
                <img src={FullName} alt="Company Full Logo" />
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-gray-100"
            >
              {sidebarOpen ? <></> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="mt-4">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex ${
                    sidebarOpen ? "justify-start gap-3 px-3" : "justify-center"
                  } items-center p-3 mx-2 rounded-md cursor-pointer transition-all duration-300
                  ${activeTab === tab.id
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100 text-gray-800"}
                  `}
                >
                  {sidebarOpen ? (
                    <>
                      <Icon className="w-5 h-6" />
                      <span>{tab.label}</span>
                    </>
                  ) : (
                    <Icon className="w-6 h-5" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile + Logout */}
        <div className="border-t p-4 flex flex-col gap-2">
          {profile && (
            <div
              className={`flex items-center ${
                sidebarOpen ? "justify-start gap-3 px-3" : "justify-center"
              } transition-all duration-300`}
            >
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
            
              {sidebarOpen && (
                <div className="transition-opacity duration-300">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-gray-500">{profile.role}</p>
                </div>
              )}
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`flex items-center w-full ${
              sidebarOpen ? "justify-start px-4 pl-7 gap-2" : "justify-center"
            } text-red-500 hover:text-red-700 mt-2 transition-all duration-300`}
          >
            <LogOut className="w-7 h-7" />
            {sidebarOpen && (
              <span className="transition-opacity duration-300">Logout</span>
            )}
          </Button>
        </div>
      </motion.div>

      {/* ✅ Main Content */}
      <div
        className={`flex-1 ml-[72px] transition-all duration-300 ${
          sidebarOpen ? "ml-[220px] blur-sm brightness-75" : ""
        }`}
      >

        {/* Page Content */}
        <main className="container mx-auto px-6 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <h2 className="text-center text-xl font-medium text-gray-700">
                Welcome to Sansan Groups
              </h2>
            )}
          </div>
        </main>
      </div>

      {/* ✅ Cancel Button Overlay */}
      {/* ✅ Smooth Cancel Button Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{
              type:"spring",
              stiffness: 450,
              damping: 20,
              duration: 0.3,
            }}
            className="fixed top-6 left-[240px] z-50"
          >
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="outline"
              className="bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center gap-2 text-gray-700 font-medium">
                <LogOut className="w-4 h-4" /> Close
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Index;
