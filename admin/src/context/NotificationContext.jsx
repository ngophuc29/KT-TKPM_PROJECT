import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";

// Create context
const NotificationContext = createContext();

// Hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Fixed admin user ID for notifications
const ADMIN_ID = "admin-dashboard-123";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [uriSocket, setUriSocket] = useState("");
  const [socket, setSocket] = useState(null);

  // Fetch socket URI and unread count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the notification service base URL
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000"}/notification/base-url`,
        );
        setUriSocket(response.data.baseUrl);

        // Get the unread notification count
        const countResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000"}/notification/unread-count`,
        );
        setUnreadCount(countResponse.data.count);
      } catch (error) {
        console.error("Error fetching notification data:", error);
      }
    };

    fetchData();

    // Set up a polling interval for unread count
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Set up socket connection
  useEffect(() => {
    if (!uriSocket) return;

    console.log("Connecting to socket server at:", uriSocket);

    const socketInstance = io(uriSocket, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);

      // Join the admin room using the fixed admin ID
      socketInstance.emit("join", ADMIN_ID);
      console.log(`Joined admin room with ID: ${ADMIN_ID}`);

      // Also join the generic 'admin' room
      socketInstance.emit("join", "admin");
      console.log("Joined generic admin room");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // Listen for admin notifications
    socketInstance.on("admin_notification", (notification) => {
      console.log("Received admin notification:", notification);

      // Show toast notification
      toast.success("Đơn hàng mới!", {
        description: `Đơn hàng #${notification.orderId} vừa được đặt thành công.`,
        duration: 5000,
        action: {
          label: "Xem đơn hàng",
          onClick: () => {
            markAsRead();
            window.location.href = "/orders";
          },
        },
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [uriSocket]);

  // Function to fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000"}/notification/unread-count`,
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Function to mark all notifications as read
  const markAsRead = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000"}/notification/mark-as-read`,
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return <NotificationContext.Provider value={{ unreadCount, markAsRead }}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;
