import React from "react";
import classNames from "classnames";

const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  className = "",
  text = null,
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  const colorClasses = {
    primary: "border-blue-600",
    white: "border-white",
    gray: "border-gray-600",
    success: "border-green-600",
    warning: "border-yellow-600",
    danger: "border-red-600",
  };

  const spinnerClasses = classNames(
    "animate-spin rounded-full border-2 border-t-transparent",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <p className="mt-2 text-sm text-gray-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
