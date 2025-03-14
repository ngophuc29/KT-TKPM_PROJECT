import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Card from "./OverviewTabs/Card";
import OverviewContent from "./OverviewTabs/OverviewContent";
import NotificationContent from "./NotificationTabs/NotificationContent";
import axios from "axios";
const Main = ({ unreadCount, setUnreadCount, loadNotifications, setLoadNotifications }) => {
  const markNotificationsAsRead = async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/notification/mark-as-read`);
      console.log("Marked as read: ", response.data);
      setUnreadCount(0);
      setLoadNotifications(prev => !prev);
    } catch (error) {
      console.error("Error marking notifications as read: ", error);
    }
  };
  return (
    <div className="mx-16">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notification" onClick={markNotificationsAsRead}>
            Notification
            <span className="flex items-center justify-center rounded-full text-red-500">
              {unreadCount > 0 ? `(${unreadCount})` : ""}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tabs content */}
        <TabsContent value="overview">
          <Card />
          <OverviewContent />
        </TabsContent>
        <TabsContent value="notification">
          <NotificationContent loadNotifications={loadNotifications}/>
        </TabsContent>
        <TabsContent value="analytics">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default Main;
