import React from "react";
import { Heart } from "lucide-react";

interface FavoriteToggleProps {
  isFavoris: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FavoriteToggle: React.FC<FavoriteToggleProps> = ({ 
  isFavoris, 
  onToggle, 
  isLoading = false,
  size = "md",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7"
  };

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`
        flex items-center justify-center 
        ${sizeClasses[size]} rounded-full border 
        transition-all duration-300 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isFavoris 
          ? "bg-red-100 border-red-500 hover:bg-red-200" 
          : "bg-white border-gray-300 hover:border-red-400 hover:bg-red-50"
        }
        ${className}
      `}
      aria-label={isFavoris ? "Ne plus suivre" : "Suivre cette campagne"}
    >
      <Heart
        className={`${iconSizeClasses[size]} transition-colors duration-300 ${
          isFavoris ? "fill-red-500 text-red-500" : "text-red-500"
        } ${isLoading ? "animate-pulse" : ""}`}
      />
    </button>
  );
};

export default FavoriteToggle;
