import React, { useEffect, useState } from "react";
import axios from "axios";

const RecentSales = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTopProducts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("https://kt-tkpm-project-inventory-service.onrender.com/stats/product-revenue");
                if (response.data && response.data.productStats) {
                    setTopProducts(response.data.productStats.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching top products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopProducts();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Top sản phẩm bán chạy</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {topProducts.map((product, index) => (
                        <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-green-600">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        maximumFractionDigits: 0
                                    }).format(product.totalRevenue)}
                                </p>
                                <p className="text-sm text-gray-500">Đã bán: {product.totalSold}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentSales;
