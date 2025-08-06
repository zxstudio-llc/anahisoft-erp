import React from 'react';
import { RgbColor } from './color';

interface RgbInputsProps {
  rgb: RgbColor;
  onChange: (rgb: RgbColor) => void;
  className?: string;
}

export const RgbInputs: React.FC<RgbInputsProps> = ({ rgb, onChange, className = "" }) => {
  const handleRgbChange = (component: keyof RgbColor, newValue: string) => {
    const val = Math.max(0, Math.min(255, parseInt(newValue) || 0));
    const newRgb = { ...rgb, [component]: val };
    onChange(newRgb);
  };

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {(['r', 'g', 'b'] as const).map((component) => (
        <div key={component} className="text-center">
          <input
            type="number"
            value={rgb[component]}
            onChange={(e) => handleRgbChange(component, e.target.value)}
            className="w-full px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="255"
          />
          <label className="block text-xs text-gray-600 mt-1 font-medium uppercase">
            {component}
          </label>
        </div>
      ))}
    </div>
  );
};