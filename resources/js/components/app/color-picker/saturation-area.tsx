import React, { useRef, useEffect, useState } from 'react';

interface SaturationAreaProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (values: { saturation: number; value: number }) => void;
  className?: string;
}

export const SaturationArea: React.FC<SaturationAreaProps> = ({ 
  hue, 
  saturation, 
  value, 
  onChange, 
  className = "" 
}) => {
  const saturationRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateSaturationValue = (e: MouseEvent | React.MouseEvent) => {
    if (!saturationRef.current) return;

    const rect = saturationRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('clientX' in e && 'clientY' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = 0;
      clientY = 0;
    }

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    
    const newSaturation = x / rect.width;
    const newValue = 1 - (y / rect.height);
    
    onChange({ saturation: newSaturation, value: newValue });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsDragging(true);
    updateSaturationValue(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      updateSaturationValue(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]); // Cambiar la dependencia a isDragging

  return (
    <div 
      ref={saturationRef}
      className={`relative cursor-crosshair rounded-lg overflow-hidden ${className}`}
      style={{
        background: `
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%)),
          linear-gradient(to top, #000, transparent)
        `
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg transform -translate-x-2.5 -translate-y-2.5 pointer-events-none"
        style={{
          left: `${saturation * 100}%`,
          top: `${(1 - value) * 100}%`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );
};