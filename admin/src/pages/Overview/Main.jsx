import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewContent from "./OverviewTabs/OverviewContent";
import AnalyticsContent from "./AnalyticsTabs/AnalyticsContent";

const Main = () => {
  return (
    <div className="mx-16">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Tabs content */}
        <TabsContent value="overview">
          {/* <Card /> */}
          <OverviewContent />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Main;
