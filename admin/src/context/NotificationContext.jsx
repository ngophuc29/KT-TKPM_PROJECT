import React, { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";

// Create context with default values
const NotificationContext = createContext({
  unreadCount: 0,
  connected: false,
  markAsRead: () => {},
  fetchUnreadCount: () => {},
});

// Export hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Function to display notification toast - moved outside the component
const showNotificationToast = (notification, markAsReadFn) => {
  toast.success(notification.title || "Đơn hàng mới!", {
    description: notification.message || `Có đơn hàng mới vừa được đặt thành công.`,
    duration: 5000,
    action: {
      label: "Xem đơn hàng",
      onClick: () => {
        markAsReadFn();
        window.location.href = "/orders";
      },
    },
  });
};

// Fixed admin ID for notifications
const ADMIN_ID = "admin-dashboard-123";

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // API URL for notifications
  const BASE_URL = import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000";
  const NOTIFICATION_URL = `${BASE_URL}/notification`;

  // Mark all notifications as read
  const markAsRead = async () => {
    try {
      await axios.put(`${NOTIFICATION_URL}/mark-as-read`);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    // Get socket server URL
    const getSocketUrl = async () => {
      try {
        const { data } = await axios.get(`${NOTIFICATION_URL}/base-url`);
        return data.baseUrl;
      } catch (error) {
        console.error("Error getting socket URL:", error);
        //return "http://localhost:4001"; // Fallback URL
        return "https://kt-tkpm-project-product-catalog-service-vuz3.onrender.com"; // Fallback URL
      }
    };

    const connectSocket = async () => {
      try {
        const socketUrl = await getSocketUrl();
        console.log("Connecting to socket server at:", socketUrl);

        const socketOptions = {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        };

        const socketInstance = io(socketUrl, socketOptions);

        socketInstance.on("connect", () => {
          console.log("Socket connected with ID:", socketInstance.id);
          setConnected(true);

          // Join specific admin room
          socketInstance.emit("join", ADMIN_ID);
          console.log("Joined admin room with ID:", ADMIN_ID);

          // Also join the generic admin room
          socketInstance.emit("join", "admin");
          console.log("Joined generic admin room");

          // Fetch initial unread count after connection
          fetchUnreadCount();
        });

        socketInstance.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
          setConnected(false);
        });

        // Handle admin notifications
        socketInstance.on("admin_notification", (notification) => {
          console.log("Received new admin notification:", notification);

          // Update unread count immediately
          setUnreadCount((prevCount) => prevCount + 1);

          // Show notification using the external function
          showNotificationToast(notification, markAsRead);
        });

        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
          setConnected(false);
        });

        setSocket(socketInstance);

        return socketInstance;
      } catch (err) {
        console.error("Error setting up socket connection:", err);
        return null;
      }
    };

    const socketInstance = connectSocket();

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.then((socket) => {
          if (socket) socket.disconnect();
        });
      }
    };
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${NOTIFICATION_URL}/unread-count`);
      if (response.data && response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Set up polling for unread count as a backup
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Context value to be provided
  const value = {
    unreadCount,
    connected,
    markAsRead,
    fetchUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;
