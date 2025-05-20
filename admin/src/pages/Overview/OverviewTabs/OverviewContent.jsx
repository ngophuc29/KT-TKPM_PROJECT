import React from "react";
import Card from "./Card";
import Chart from "./Chart";
import RecentSales from "./RecentSales";

const OverviewContent = () => {
  return (
    <div className="space-y-6" style={{marginTop: "40px"}}>
      <Card />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart />
        </div>
        <div>
          <RecentSales />
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;