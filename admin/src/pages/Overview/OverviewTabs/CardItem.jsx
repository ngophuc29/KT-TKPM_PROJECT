import React from "react";

const CardItem = ({ title, value, icon, color }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default CardItem;
