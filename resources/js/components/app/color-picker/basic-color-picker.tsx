import React, { useState, useEffect } from 'react';
import { colorUtils } from './colorUtils';
import { RgbColor } from './color';
import { SaturationArea } from './saturation-area';
import { HueSlider } from './hue-slider';
import { RgbInputs } from './rgb-inputs';
import { ColorPreview } from './color-preview';

interface BasicColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  className?: string;
}

export const BasicColorPicker: React.FC<BasicColorPickerProps> = ({ 
  color, 
  onChange, 
  onClose, 
  className = "" 
}) => {
  const [r, g, b] = colorUtils.hexToRgb(color);
  const [h, s, v] = colorUtils.rgbToHsv(r, g, b);
  
  const [hue, setHue] = useState(h);
  const [saturation, setSaturation] = useState(s);
  const [value, setValue] = useState(v);
  const [rgbValues, setRgbValues] = useState<RgbColor>({ r, g, b });

  useEffect(() => {
    const [newR, newG, newB] = colorUtils.hsvToRgb(hue, saturation, value);
    setRgbValues({ r: newR, g: newG, b: newB });
    const newColor = colorUtils.rgbToHex(newR, newG, newB);
    onChange(newColor);
  }, [hue, saturation, value, onChange]);

  const handleSaturationChange = ({ saturation: newS, value: newV }: { saturation: number; value: number }) => {
    setSaturation(newS);
    setValue(newV);
  };

  const handleRgbChange = (newRgb: RgbColor) => {
    setRgbValues(newRgb);
    const [newH, newS, newV] = colorUtils.rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(newH);
    setSaturation(newS);
    setValue(newV);
  };

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-xl shadow-2xl ${className}`}
    onClick={(e) => {
      e.stopPropagation();
    }}
    >
      <SaturationArea
        hue={hue}
        saturation={saturation}
        value={value}
        onChange={handleSaturationChange}
        className="w-full h-56 mb-4"
      />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m2 22 1-1h3l9-9"/>
            <path d="M3 21v-3l9-9"/>
            <path d="m15 6 3.5-3.5a2.12 2.12 0 0 1 3 3L18 9l-3-3"/>
          </svg>
        </div>
        
        <ColorPreview color={color} className="w-12 h-8 rounded-lg" />
        
        <HueSlider
          hue={hue}
          onChange={setHue}
          className="flex-1 h-8"
        />
      </div>

      <RgbInputs rgb={rgbValues} onChange={handleRgbChange} />
    </div>
  );
};