import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const AnalyticsContent = () => {
  const [generalStats, setGeneralStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [generalRes, categoryRes, orderRes] = await Promise.all([
          axios.get("https://kt-tkpm-project-inventory-service.onrender.com/stats/general"),
          axios.get("https://kt-tkpm-project-inventory-service.onrender.com/stats/inventory-by-category"),
          axios.get("https://kt-tkpm-project-inventory-service.onrender.com/stats/order-status")
        ]);

        console.log("General Stats Response:", generalRes.data);
        console.log("Category Stats Response:", categoryRes.data);
        console.log("Order Stats Response:", orderRes.data);

        setGeneralStats(generalRes.data);
        setCategoryStats(categoryRes.data);
        setOrderStats(orderRes.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Prepare data for charts
  const categoryData = categoryStats?.categoryStats
    ? Object.entries(categoryStats.categoryStats).map(([category, data]) => ({
        name: category,
        value: data.totalStock,
      }))
    : [];

  const orderStatusData = orderStats?.statusStats
    ? Object.entries(orderStats.statusStats).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  // Debug information
  console.log("Category Data:", categoryData);
  console.log("Order Status Data:", orderStatusData);
  console.log("General Stats:", generalStats);

  return (
    <div className="space-y-6">
      {/* General Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng sản phẩm</CardTitle>
            <CardDescription>
              Số lượng sản phẩm khác nhau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{generalStats?.general.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng đơn hàng</CardTitle>
            <CardDescription>
              Tổng số đơn hàng đã đặt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{generalStats?.general.totalOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng tồn kho</CardTitle>
            <CardDescription>
              Tổng số lượng sản phẩm trong kho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{generalStats?.general.totalInventory || 0}</p>
              <p className="text-sm text-muted-foreground">
                {generalStats?.general.totalProducts || 0} sản phẩm khác nhau
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu</CardTitle>
            <CardDescription>
              Tổng doanh thu từ các đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(generalStats?.general.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố sản phẩm theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Số lượng đơn hàng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm tồn kho thấp</CardTitle>
          <CardDescription>
            Danh sách các sản phẩm cần được bổ sung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Số lượng hiện tại</TableHead>
                <TableHead>Danh mục</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generalStats?.inventoryAlerts.lowStockProducts.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.currentStock}</TableCell>
                  <TableCell>{product.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tổng sản phẩm</TableHead>
                <TableHead>Tổng tồn kho</TableHead>
                <TableHead>Sản phẩm tồn kho thấp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryStats?.categoryStats &&
                Object.entries(categoryStats.categoryStats).map(([category, data]) => (
                  <TableRow key={category}>
                    <TableCell>{category}</TableCell>
                    <TableCell>{data.totalProducts}</TableCell>
                    <TableCell>{data.totalStock}</TableCell>
                    <TableCell>{data.lowStockCount}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsContent; 