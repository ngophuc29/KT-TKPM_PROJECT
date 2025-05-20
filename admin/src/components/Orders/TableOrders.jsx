import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
// Nếu bạn có component Container của UI riêng, hãy import đúng đường dẫn.
// Nếu không, bạn có thể sử dụng thẻ div như dưới đây.
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import OrderDetailModal from "./OrderDetailModal";
import OrderEditModal from "./OrderEditModal";

// Đường dẫn API (sửa lại nếu cần)
const ORDER_API_URL = "https://kt-tkpm-project-order-service.onrender.com";

// Data mẫu (bạn có thể thay bằng axios.get khi API đã ổn)
const sampleData = [
  {
    "customer": {
      "name": "Huỳnh Văn Ngà",
      "address": "Ho Chi Minh",
      "phone": "0368953295",
      "email": "ngophuc2911@gmail.com"
    },
    "shipping": {
      "method": "standard",
      "fee": 30000,
      "status": "processing",
      "trackingNumber": ""
    },
    "payment": {
      "method": "cod",
      "status": "pending"
    },
    "notes": {
      "customerNote": "",
      "sellerNote": ""
    },
    "_id": "67dcd4c789ccf9ee472898b4",
    "userId": "64e65e8d3d5e2b0c8a3e9f12",
    "items": [
      {
        "productId": "67dcc83742c66ecfcbc9c659",
        "name": "Huỳnh Văn Ngà",
        "quantity": 2,
        "price": 600,
        "_id": "67dcd4c789ccf9ee472898b5"
      }
    ],
    "finalTotal": 31200,
    "status": "cancelled",
    "createdAt": "2025-03-21T02:53:59.340Z",
    "updatedAt": "2025-03-21T02:54:09.798Z",
    "__v": 0
  },
  // ... các đơn hàng khác theo cấu trúc bạn cung cấp
];

export default function TableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOrderId, setModalOrderId] = useState(null);
  const [editModalOrderId, setEditModalOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
        // if (useSampleData) setOrders(sampleData);
      } catch (err) {
        setError("Lỗi khi lấy danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      const updateData = encodeURIComponent(JSON.stringify({ status: newStatus }));
      await axios.put(`${ORDER_API_URL}/update/${orderId}/${updateData}`);
      const response = await axios.get(ORDER_API_URL);
      setOrders(response.data);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái đơn hàng");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Force modal to show for testing
  useEffect(() => {
    console.log("Component mounted, checking for OrderEditModal component");
  }, []);

  const handleEdit = (orderId) => {
    console.log("Opening edit modal for order:", orderId);
    setEditModalOrderId(orderId);
  };

  // Add a function to refresh orders
  const refreshOrders = async () => {
    try {
      setActionLoading(true);
      const response = await axios.get(ORDER_API_URL);
      setOrders(response.data);
      console.log("Orders refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh orders:", err);
      setError("Không thể cập nhật danh sách đơn hàng");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminCancelOrder = async (orderId, currentStatus) => {
    if (!["pending", "confirmed" ].includes(currentStatus)) {
      return alert("Chỉ có thể hủy đơn hàng ở trạng thái: pending, confirmed ");
    }
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      try {
        setActionLoading(true);
        await axios.post(`${ORDER_API_URL}/admin/cancel/${orderId}`);
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
        alert("Đơn hàng đã được hủy.");
      } catch (err) {
        alert("Lỗi khi hủy đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDelete = async (orderId, currentStatus) => {
    if (currentStatus === "confirmed") {
      return alert("Không thể xóa đơn hàng đã được xác nhận.");
    }
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      try {
        setActionLoading(true);
        await axios.delete(`${ORDER_API_URL}/admin/delete/${orderId}`);
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
        alert("Đơn hàng đã được xóa.");
      } catch (err) {
        alert("Lỗi khi xóa đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };
  

  const handleViewDetail = (orderId) => {
    setModalOrderId(orderId);
  };

  const columns = [
    {
      accessorKey: "_id",
      header: "Mã đơn",
    },
    {
      accessorFn: (row) => row.customer?.name,
      header: "Khách hàng",
    },
    {
      accessorFn: (row) => row.payment?.method,
      header: "Thanh toán",
      cell: (info) => info.getValue() === "cod" ? "COD" : info.getValue(),
    },
    {
      accessorFn: (row) => row.payment?.status,
      header: "TT Thanh toán",
    },
    {
      accessorFn: (row) => row.shipping?.fee,
      header: "Phí ship",
      cell: (info) => `${info.getValue()?.toLocaleString()} đ`,
    },
    {
      accessorFn: (row) => row.shipping?.status,
      header: "TT Giao hàng",
    },
    {
      accessorKey: "finalTotal",
      header: "Tổng tiền",
      cell: (info) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(info.getValue()),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "pending" && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleChangeStatus(order._id, "confirmed")}
                disabled={actionLoading}
              >
                Xác nhận
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleChangeStatus(order._id, "completed")}
                disabled={actionLoading}
              >
                Hoàn thành
              </Button>
            )}
            <Button
              className={`${order.status === "pending" || order.status === "confirmed"
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-yellow-300 cursor-not-allowed"
                }`}
              onClick={() =>
                (order.status === "pending" || order.status === "confirmed") &&
                handleEdit(order._id)
              }
              disabled={!(order.status === "pending" || order.status === "confirmed")}
            >
              Chỉnh sửa
            </Button>
            <Button
              className={`${["pending", "confirmed"].includes(order.status)
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
                }`}
              onClick={() =>
                ["pending", "confirmed"].includes(order.status) &&
                handleAdminCancelOrder(order._id, order.status)
              }
              disabled={!["pending", "confirmed"].includes(order.status)}
            >
              Hủy
            </Button>

            <Button
              variant="outline"
              className={`${order.status !== "confirmed"
                ? "text-red-600 border-red-600 hover:bg-red-100"
                : "text-red-300 border-red-300 cursor-not-allowed"
                }`}
              onClick={() =>
                order.status !== "confirmed" && handleDelete(order._id, order.status)
              }
              disabled={order.status === "confirmed"}
            >
              Xóa
            </Button>


            <Button
              className="bg-gray-600 hover:bg-gray-700"
              onClick={() => handleViewDetail(order._id)}
            >
              Chi Tiết Đơn Hàng
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <div className="p-4 text-center text-sm">Đang tải dữ liệu đơn hàng...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 relative">
      <h2 className="mb-4 text-xl font-bold">Quản lý đơn hàng (Admin)</h2>
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => {
            const sorted = [...orders].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sorted);
          }}
        >
          Mới nhất
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const sorted = [...orders].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            setOrders(sorted);
          }}
        >
          Cũ nhất
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                Không có đơn hàng nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Ensure modal gets rendered with highest z-index */}
      <div className="relative z-50">
        {modalOrderId && (
          <OrderDetailModal
            orderId={modalOrderId}
            onClose={() => setModalOrderId(null)}
          />
        )}

        {editModalOrderId && (
          <OrderEditModal
            orderId={editModalOrderId}
            onClose={() => {
              console.log("Closing edit modal");
              setEditModalOrderId(null);
            }}
            onOrderUpdated={() => {
              console.log("Order updated, refreshing order list");
              refreshOrders();
            }}
          />
        )}
      </div>
    </div>
  );
}
