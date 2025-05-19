import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Chart = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/inventory/stats/revenue?period=month");
        if (response.data && response.data.revenueByPeriod) {
          const { revenueByPeriod } = response.data;
          const labels = Object.keys(revenueByPeriod).map(date => {
            const [year, month] = date.split('-');
            return `${month}/${year}`;
          });

          setChartData({
            labels,
            datasets: [{
              label: 'Doanh thu theo tháng',
              data: Object.values(revenueByPeriod),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ doanh thu theo tháng',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div style={{ height: '400px', position: 'relative' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : chartData ? (
          <Bar options={options} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
