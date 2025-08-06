import React, { useState } from 'react';
import { CustomColorInput } from './custom-color-input';
import { ColorPreview } from './color-preview';

interface ColorState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const ModularColorPickerDemo: React.FC = () => {
  const [colors, setColors] = useState<ColorState>({
    primaryColor: '#b2c7b4',
    secondaryColor: '#ff6b6b',
    accentColor: '#4ecdc4'
  });

  const updateColor = (key: keyof ColorState) => (color: string) => {
    setColors(prev => ({ ...prev, [key]: color }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Modular Color Picker Components
        </h1>
        
        <CustomColorInput
          label="Primary"
          color={colors.primaryColor}
          onChange={updateColor('primaryColor')}
        />
        
        <CustomColorInput
          label="Secondary"
          color={colors.secondaryColor}
          onChange={updateColor('secondaryColor')}
        />
        
        <CustomColorInput
          label="Accent"
          color={colors.accentColor}
          onChange={updateColor('accentColor')}
        />

        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Vista Previa</h3>
          <div className="flex gap-4">
            {[
              { color: colors.primaryColor, label: 'Primary' },
              { color: colors.secondaryColor, label: 'Secondary' },
              { color: colors.accentColor, label: 'Accent' }
            ].map(({ color, label }) => (
              <div key={label} className="flex flex-col items-center">
                <ColorPreview color={color} size="w-16 h-16" className="rounded-lg shadow-md" />
                <span className="text-sm text-gray-600 mt-2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModularColorPickerDemo;