"use client";

import * as React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "There are no items to display at this time.",
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="mb-4 text-[#A3A3A3]">{icon}</div>}
      <h3 className="text-white/95 text-lg font-medium mb-2">{title}</h3>
      <p className="text-[#A3A3A3] text-sm text-center max-w-md mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

