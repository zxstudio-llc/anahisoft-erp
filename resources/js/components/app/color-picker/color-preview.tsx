import React from 'react';

interface ColorPreviewProps {
  color: string;
  size?: string;
  className?: string;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({ 
  color, 
  size = "w-8 h-8", 
  className = "" 
}) => {
  return (
    <div 
      className={`${size} rounded-full border-2 border-gray-200 shadow-sm ${className}`}
      style={{ backgroundColor: color }}
    />
  );
};