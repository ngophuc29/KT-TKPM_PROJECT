import { useEffect, useState } from "react";
import axios from "axios";
import CardItem from "./CardItem";
import { FaShoppingCart, FaBox, FaExclamationTriangle, FaMoneyBillWave } from "react-icons/fa";

const Card = () => {
  const [stats, setStats] = useState({
    orderStats: {},
    productStats: {},
    revenueStats: {},
    inventoryStats: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/inventory/stats/detailed`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Tổng đơn hàng",
      value: stats.orderStats?.total || 0,
      icon: <FaShoppingCart className="text-blue-500" />,
      details: [
        { label: "Đang xử lý", value: stats.orderStats?.byStatus?.pending || 0 },
        { label: "Đã xác nhận", value: stats.orderStats?.byStatus?.confirmed || 0 },
        { label: "Hoàn thành", value: stats.orderStats?.byStatus?.completed || 0 }
      ]
    },
    {
      title: "Tổng sản phẩm",
      value: stats.productStats?.total || 0,
      icon: <FaBox className="text-green-500" />,
      details: [
        { label: "Sắp hết hàng", value: stats.productStats?.lowStock || 0 },
        { label: "Hết hàng", value: stats.productStats?.outOfStock || 0 }
      ]
    },
    {
      title: "Tổng doanh thu",
      value: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(stats.revenueStats?.total || 0),
      icon: <FaMoneyBillWave className="text-yellow-500" />,
      details: [
        {
          label: "Tháng này",
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(stats.revenueStats?.thisMonth || 0)
        },
        {
          label: "Tháng trước",
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(stats.revenueStats?.lastMonth || 0)
        }
      ]
    },
    {
      title: "Cảnh báo tồn kho",
      value: stats.productStats?.lowStock || 0,
      icon: <FaExclamationTriangle className="text-red-500" />,
      details: [
        { label: "Tổng số lượng", value: stats.inventoryStats?.totalItems || 0 },
        {
          label: "Tổng giá trị",
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(stats.inventoryStats?.totalValue || 0)
        }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <CardItem key={index} {...card} />
      ))}
    </div>
  );
};

export default Card;
