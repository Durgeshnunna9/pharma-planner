
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { CalendarDays, TrendingUp, Package, Factory } from "lucide-react";

const DashboardTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Sample data for production analytics
  const dailyProduction = [
    { date: "2025-01-01", human: 1200, veterinary: 800, total: 2000 },
    { date: "2025-01-02", human: 1500, veterinary: 900, total: 2400 },
    { date: "2025-01-03", human: 1100, veterinary: 700, total: 1800 },
    { date: "2025-01-04", human: 1800, veterinary: 1200, total: 3000 },
    { date: "2025-01-05", human: 1400, veterinary: 850, total: 2250 },
    { date: "2025-01-06", human: 1600, veterinary: 950, total: 2550 },
    { date: "2025-01-07", human: 1300, veterinary: 750, total: 2050 },
  ];

  const bestSellingProducts = [
    { name: "Amoxicillin", category: "Human", quantity: 15000, revenue: 450000 },
    { name: "Paracetamol", category: "Human", quantity: 12000, revenue: 360000 },
    { name: "Ivermectin", category: "Veterinary", quantity: 8000, revenue: 320000 },
    { name: "Azithromycin", category: "Human", quantity: 6500, revenue: 260000 },
    { name: "Multivitamin", category: "Veterinary", quantity: 5200, revenue: 156000 },
  ];

  const categoryDistribution = [
    { name: "Human", value: 65, count: 162 },
    { name: "Veterinary", value: 35, count: 88 },
  ];

  const monthlyTrends = [
    { month: "Jan", orders: 45, production: 42000 },
    { month: "Feb", orders: 52, production: 48000 },
    { month: "Mar", orders: 48, production: 45000 },
    { month: "Apr", orders: 61, production: 58000 },
    { month: "May", orders: 55, production: 52000 },
    { month: "Jun", orders: 67, production: 63000 },
  ];

  const COLORS = ['#22c55e', '#16a34a'];

  const chartConfig = {
    human: {
      label: "Human",
      color: "#22c55e",
    },
    veterinary: {
      label: "Veterinary", 
      color: "#16a34a",
    },
    total: {
      label: "Total",
      color: "#15803d",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Production Dashboard</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Factory className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156,240 L</div>
            <p className="text-xs text-green-100">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-blue-100">+3 new orders today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Batches</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">238</div>
            <p className="text-xs text-purple-100">+8% completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CalendarDays className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4.2M</div>
            <p className="text-xs text-orange-100">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Daily Production */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-green-700">Production Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                {selectedDate?.toDateString() || "Select a date"}
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Human Products: 1,400 L</p>
                <p className="text-gray-600">Veterinary Products: 850 L</p>
                <p className="font-semibold text-green-700">Total: 2,250 L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Production Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-700">Daily Production Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={dailyProduction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="human" stackId="a" fill="var(--color-human)" />
                <Bar dataKey="veterinary" stackId="a" fill="var(--color-veterinary)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellingProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.quantity.toLocaleString()} L</p>
                    <p className="text-sm text-green-600">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution and Monthly Trends */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Product Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Monthly Order Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
