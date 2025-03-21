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

// Đường dẫn API (sửa lại nếu cần)
const ORDER_API_URL = "http://localhost:3000/api/orders";

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
  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Nếu API hoạt động, sử dụng axios.get:
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
        // Tạm thời dùng sampleData để debug:
        // setOrders(sampleData);
        // console.log("Orders:", sampleData);
      } catch (err) {
        setError("Lỗi khi lấy danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Hàm cập nhật trạng thái đơn hàng (Admin)
  // const handleChangeStatus = async (orderId, newStatus) => {
  //   try {
  //     setActionLoading(true);
  //     await axios.put(`${ORDER_API_URL}/${orderId}`, { status: newStatus });
  //     const response = await axios.get(ORDER_API_URL);
  //     setOrders(response.data);
  //   } catch (err) {
  //     alert("Lỗi khi cập nhật trạng thái đơn hàng");
  //     console.error(err);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };
  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      // Tạo chuỗi JSON chứa dữ liệu update và encode để truyền qua URL
      const updateData = encodeURIComponent(JSON.stringify({ status: newStatus }));
      // Gọi API update với endpoint theo định dạng: /:orderId/:updateData
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

  // Hàm chỉnh sửa đơn hàng (ví dụ mở modal, chuyển trang,...)
  const handleEdit = (orderId) => {
    alert(`Chỉnh sửa đơn hàng ${orderId}`);
  };

  // Hàm hủy đơn hàng (Admin)
  const handleAdminCancelOrder = async (orderId, currentStatus) => {
    if (!(currentStatus === "pending" || currentStatus === "confirmed" || currentStatus === "completed")) {
      alert("Chỉ đơn hàng chưa giao (pending, confirmed) hoặc đã hoàn thành (completed) mới có thể hủy.");
      return;
    }
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      try {
        setActionLoading(true);
        await axios.post(`${ORDER_API_URL}/admin/cancel/${orderId}`);
        alert("Đơn hàng đã được hủy bởi Admin");
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
      } catch (err) {
        alert("Lỗi khi hủy đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Hàm xóa đơn hàng (Admin)
  const handleDelete = async (orderId, currentStatus) => {
    if (currentStatus !== "cancelled") {
      alert("Đơn hàng phải có trạng thái 'cancelled' mới được xóa");
      return;
    }
    if (
      window.confirm("Bạn có chắc muốn xóa đơn hàng này không? Thao tác này sẽ xóa hoàn toàn đơn hàng.")
    ) {
      try {
        setActionLoading(true);
        await axios.delete(`${ORDER_API_URL}/admin/delete/${orderId}`);
        alert("Đơn hàng đã được xóa bởi Admin");
        const response = await axios.get(ORDER_API_URL);
        setOrders(response.data);
      } catch (err) {
        alert("Lỗi khi xóa đơn hàng");
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };
  // Khi nhấn nút "Chi Tiết Đơn Hàng", lưu orderId vào state để mở modal
  const handleViewDetail = (orderId) => {
    setModalOrderId(orderId);
  };
  // Định nghĩa cột cho react-table
  const columns = [
    {
      accessorKey: "_id",
      header: "Mã đơn",
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.customer?.name,
      header: "Khách hàng",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "finalTotal",
      header: "Tổng tiền",
      cell: (info) => {
        const value = info.getValue();
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value);
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: (info) => info.getValue(),
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
          <div className="flex items-center  gap-2">
            {order.status === "pending" && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => handleChangeStatus(order._id, "confirmed")}
                disabled={actionLoading}
              >
                Xác nhận
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button
                variant="success"
                size="sm"
                onClick={() => handleChangeStatus(order._id, "completed")}
                disabled={actionLoading}
              >
                Hoàn thành
              </Button>
            )}
            {(order.status === "pending" || order.status === "confirmed") ? (
              <Button variant="info" size="sm" onClick={() => handleEdit(order._id)} disabled={actionLoading}>
                Chỉnh sửa
              </Button>
            ) : (
              <Button variant="info" size="sm" disabled>
                Chỉnh sửa
              </Button>
            )}
            {(order.status === "pending" ||
              order.status === "confirmed" ||
              order.status === "completed") ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAdminCancelOrder(order._id, order.status)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
            ) : (
              <Button variant="destructive" size="sm" disabled>
                Hủy
              </Button>
            )}
            {order.status === "cancelled" ? (
              <Button
                variant="outlineDestructive"
                size="sm"
                onClick={() => handleDelete(order._id, order.status)}
                disabled={actionLoading}
              >
                Xóa
              </Button>
            ) : (
              <Button variant="outlineDestructive" size="sm" disabled>
                Xóa
              </Button>
            )}
            <Button variant="destructive" size="sm"
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
    return (
      <div className="p-4 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Quản lý đơn hàng (Admin)</h2>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
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
      {modalOrderId && (
        <OrderDetailModal
          orderId={modalOrderId}
          onClose={() => setModalOrderId(null)}
        />
      )}
    </div>
  );
}
