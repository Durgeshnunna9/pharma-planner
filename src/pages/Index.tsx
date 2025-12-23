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
  Component,
  FileSpreadsheet,
  Menu,
  X
} from "lucide-react";
import ProductsTab from "@/components/ProductsTab";
import CustomersTab from "@/components/CustomersTab";
import ProductionTab from "@/components/ProductionTab";
import ShopFloorTab from "@/components/ShopFloorTab";
import DashboardTab from "@/components/DashboardTab";
import CostConfigTab from "@/components/CostConfigTab"
import { Button } from "@/components/ui/button";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    { id: "products", label: "Products", icon: PackageOpen, component: ProductsTab, roles: ["admin", "production", "manager", "qc", "store","user"] },
    { id: "customers", label: "Customers", icon: Smile, component: CustomersTab, roles: ["admin", "production", "manager", "qc","store"] },
    { id: "production", label: "Production", icon: Factory, component: ProductionTab, roles: ["admin", "production", "manager", "qc", "store"] },
    { id: "shopfloor", label: "Shop Floor", icon: Monitor, component: ShopFloorTab, roles: ["admin", "production", "manager", "qc", "store"] },
    { id: "costConfig", label: "Cost Configarator", icon: FileSpreadsheet , component: CostConfigTab, roles: ["admin", "production", "manager", "qc", "store"] }
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(profile?.role));
  const ActiveComponent = visibleTabs.find((tab) => tab.id === activeTab)?.component;
  const activeTabName = visibleTabs.find((tab) => tab.id === activeTab)?.label || "Dashboard";

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex overflow-hidden relative">
      {/* ✅ Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
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
      )}

      {/* ✅ Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          !isMobile ? (sidebarOpen ? "ml-[220px] blur-sm brightness-75" : "ml-[72px]") : ""
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Company Logo" className="w-8 h-8"/>
              <h1 className="font-bold text-lg">{activeTabName}</h1>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
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

      {/* ✅ Desktop Cancel Button Overlay */}
      {!isMobile && (
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
      )}

      {/* ✅ Mobile Floating Menu Button */}
      {isMobile && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:bg-green-700 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      )}

      {/* ✅ Mobile Menu Modal */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Menu Header */}
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={Logo} alt="Company Logo" className="w-10 h-10"/>
                    <div>
                      <h2 className="font-bold text-lg">Menu</h2>
                      <p className="text-xs text-gray-500">Sansan Groups</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile in Menu */}
                {profile && (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      {profile.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{profile.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.div
                      key={tab.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center gap-4 p-4 mb-2 rounded-xl cursor-pointer transition-all ${
                        activeTab === tab.id
                          ? "bg-green-100 text-green-700 shadow-md"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.id ? "bg-green-200" : "bg-gray-100"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{tab.label}</span>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;