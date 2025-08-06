import React, { useRef, useEffect } from 'react';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
  className?: string;
}

export const HueSlider: React.FC<HueSliderProps> = ({ hue, onChange, className = "" }) => {
  const hueRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateHueValue = (e: MouseEvent) => {
    if (!hueRef.current) return;
    
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newHue = (x / rect.width) * 360;
    
    onChange(newHue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    updateHueValue(e.nativeEvent);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      updateHueValue(e);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    if (isDragging.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={hueRef}
      className={`cursor-pointer rounded-lg overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="relative h-full"
        style={{ left: `${(hue / 360) * 100}%` }}
      >
        <div className="absolute top-1/2 w-3 h-6 bg-white border border-gray-300 rounded-sm shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};