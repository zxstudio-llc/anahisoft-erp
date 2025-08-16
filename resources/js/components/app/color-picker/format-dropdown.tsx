import React, { useState, useRef, useEffect } from 'react';
import { ColorFormat } from './color';

interface FormatDropdownProps {
  format: ColorFormat;
  onChange: (format: ColorFormat) => void;
  className?: string;
}

const colorFormatOptions: ColorFormat[] = ['HEX', 'HSL', 'OKLCH', 'RGB'];

export const FormatDropdown: React.FC<FormatDropdownProps> = ({ 
  format, 
  onChange, 
  className = "" 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowDropdown(!showDropdown);
        }}
        className="flex items-center gap-1 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
        type="button" // Asegurar que no sea tipo submit
      >
        {format}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[80px]">
          {colorFormatOptions.map((formatOption) => (
            <button
            key={formatOption}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(formatOption);
              setShowDropdown(false);
            }}
            type="button" // Asegurar que no sea tipo submit
            className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
              format === formatOption ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            {formatOption}
          </button>
          ))}
        </div>
      )}
    </div>
  );
};