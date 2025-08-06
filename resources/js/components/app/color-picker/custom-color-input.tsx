import React, { useState, useRef, useEffect } from 'react';
import { colorUtils } from './colorUtils';
import { ColorFormat, ColorComponent } from './color';
import { BasicColorPicker } from './basic-color-picker';
import { FormatDropdown } from './format-dropdown';
import { toast } from "sonner"
import { Input } from '@/components/ui/input';

interface CustomColorInputProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
    showPicker?: boolean;
    onPickerToggle?: (show: boolean) => void;
    className?: string;
    initialFormat?: ColorFormat; // Agregar prop opcional para formato inicial
    onFormatChange?: (format: ColorFormat) => void; // Callback opcional para notificar cambios de formato
}

export const CustomColorInput: React.FC<CustomColorInputProps> = ({
    label,
    color,
    onChange,
    showPicker = false,
    onPickerToggle,
    className = "",
    initialFormat = 'HEX',
    onFormatChange
}) => {
    const [internalShowPicker, setInternalShowPicker] = useState(false);
    const [colorFormat, setColorFormat] = useState<ColorFormat>(initialFormat);
    
    // Debug: Log cuando cambia el formato
    useEffect(() => {
        console.log('Color format changed to:', colorFormat);
    }, [colorFormat]);

    const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const isPickerVisible = onPickerToggle !== undefined ? showPicker : internalShowPicker;
    const togglePicker = onPickerToggle || (() => setInternalShowPicker(!internalShowPicker));

    // Missing handleFormatChange function
    const handleFormatChange = (newFormat: ColorFormat) => {
        console.log('Format changing from', colorFormat, 'to', newFormat);
        setColorFormat(newFormat);
        
        // NO limpiar editingValues aquí - mantener los valores mientras el usuario está editando
        
        // Notify parent component if callback provided
        if (onFormatChange) {
            onFormatChange(newFormat);
        }
    };

    const getFormattedColor = (): string => {
        const [r, g, b] = colorUtils.hexToRgb(color);
        switch (colorFormat) {
            case 'HEX':
                return color.toUpperCase();
            case 'HSL':
                const [h, s, l] = colorUtils.rgbToHsl(r, g, b);
                return `hsl(${h}, ${s}%, ${l}%)`;
            case 'OKLCH':
                const [lch_l, lch_c, lch_h] = colorUtils.rgbToOklch(r, g, b);
                return `oklch(${lch_l}% ${lch_c} ${lch_h})`;
            case 'RGB':
                return `rgb(${r}, ${g}, ${b})`;
            default:
                return color.toUpperCase();
        }
    };

    const getColorComponents = (): ColorComponent[] => {
        const [r, g, b] = colorUtils.hexToRgb(color);
        switch (colorFormat) {
            case 'HEX':
                return [
                    { label: 'HEX', value: color.toUpperCase(), unit: '' }
                ];
            case 'HSL':
                const [h, s, l] = colorUtils.rgbToHsl(r, g, b);
                console.log('getColorComponents HSL:', { h, s, l, originalColor: color });
                return [
                    { label: 'H', value: h, unit: '°' },
                    { label: 'S', value: s, unit: '%' },
                    { label: 'L', value: l, unit: '%' }
                ];
            case 'OKLCH':
                const [lch_l, lch_c, lch_h] = colorUtils.rgbToOklch(r, g, b);
                return [
                    { label: 'L', value: lch_l, unit: '%' },
                    { label: 'C', value: lch_c, unit: '' },
                    { label: 'H', value: lch_h, unit: '°' }
                ];
            case 'RGB':
                return [
                    { label: 'R', value: r, unit: '' },
                    { label: 'G', value: g, unit: '' },
                    { label: 'B', value: b, unit: '' }
                ];
            default:
                return [{ label: 'HEX', value: color.toUpperCase(), unit: '' }];
        }
    };

    const handleInputChange = (componentLabel: string, value: string) => {
        setEditingValues(prev => ({
            ...prev,
            [componentLabel]: value
        }));
    };

    const handleInputBlur = (componentLabel: string, value: string) => {
        // NO procesar inmediatamente el blur - solo marcar que este input perdió el foco
        // La lógica de actualización se maneja en handleClickOutside
    };

    const commitEditingValues = () => {
        if (Object.keys(editingValues).length === 0) return;

        console.log('Committing editing values:', editingValues);
        
        try {
            const components = getColorComponents();
            const newComponents = components.map(comp => {
                if (editingValues[comp.label] !== undefined) {
                    const editedValue = editingValues[comp.label];
                    return { ...comp, value: parseFloat(editedValue) || comp.value };
                }
                return comp;
            });

            let newColor = color;

            switch (colorFormat) {
                case 'HEX':
                    const hexValue = editingValues['HEX'];
                    if (hexValue && hexValue.match(/^#?[0-9A-Fa-f]{6}$/)) {
                        newColor = hexValue.startsWith('#') ? hexValue : `#${hexValue}`;
                    }
                    break;
                case 'RGB':
                    const [r, g, b] = newComponents.map(c => Math.max(0, Math.min(255, parseFloat(c.value.toString()) || 0)));
                    newColor = colorUtils.rgbToHex(r, g, b);
                    break;
                case 'HSL':
                    const [h, s, l] = newComponents.map((c, i) => {
                        const val = parseFloat(c.value.toString()) || 0;
                        if (i === 0) return Math.max(0, Math.min(360, val)); // H: 0-360
                        return Math.max(0, Math.min(100, val)); // S,L: 0-100
                    });
                    const [nr, ng, nb] = colorUtils.hslToRgb(h, s, l);
                    newColor = colorUtils.rgbToHex(nr, ng, nb);
                    break;
                case 'OKLCH':
                    const [ol, oc, oh] = newComponents.map((c, i) => {
                        const val = parseFloat(c.value.toString()) || 0;
                        if (i === 0) return Math.max(0, Math.min(100, val)); // L: 0-100
                        if (i === 1) return Math.max(0, val); // C: 0+
                        return Math.max(0, Math.min(360, val)); // H: 0-360
                    });
                    const [or, og, ob] = colorUtils.oklchToRgb(ol, oc, oh);
                    newColor = colorUtils.rgbToHex(or, og, ob);
                    break;
            }

            console.log('Color conversion result:', { oldColor: color, newColor, format: colorFormat });

            // Solo actualizar si el color realmente cambió
            if (newColor !== color) {
                onChange(newColor);
            }
        } catch (error) {
            console.error('Error committing editing values:', error);
            toast.error('Invalid color value');
        }

        // Limpiar todos los valores de edición
        setEditingValues({});
    };

    const handleInputKeyDown = (e: React.KeyboardEvent, componentLabel: string, value: string) => {
        if (e.key === 'Enter') {
            // Commit all changes when Enter is pressed
            commitEditingValues();
            e.currentTarget.blur(); // Remove focus from the input
        }
        if (e.key === 'Escape') {
            // Cancel all editing and restore original values
            setEditingValues({});
            e.currentTarget.blur(); // Remove focus from the input
        }
    };

    const handleCopyColor = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!navigator.clipboard) {
            toast.error('Clipboard API not available');
            return;
        }
        try {
            await navigator.clipboard.writeText(getFormattedColor());
            toast.success('Color copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy color:', err);
            toast.error('Failed to copy color');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Commit any pending changes when clicking outside the entire component
                commitEditingValues();
                
                if (onPickerToggle === undefined) {
                    setInternalShowPicker(false);
                }
            }
        };

        // Always listen for clicks outside to commit changes
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPickerVisible, onPickerToggle, editingValues, colorFormat, color]); // Add dependencies

    return (
        <div className={`w-full bg-gray-50 rounded-xl ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium text-gray-900 capitalize">{label}</h3>
                <div className="flex items-center gap-2">
                    <FormatDropdown
                        format={colorFormat}
                        onChange={handleFormatChange}
                    />
                </div>
            </div>
            <div ref={containerRef} className="relative">
                <div className="border-input gap-2 flex items-center justify-between file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-2 text-base shadow-xs transition-[color,box-shadow] outline-none">
                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => togglePicker(!isPickerVisible)}
                            className="w-6 h-6 rounded-full border-1 border-gray-200 shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            style={{ backgroundColor: color }}
                            aria-label={`${label} color picker`}
                        />
                    </div>
                    <div className="flex flex-row gap-1 w-full justify-between">
                        {getColorComponents().map((component, index) => (
                            <div key={index} className="items-center flex">
                                <div className="text-xs text-gray-500">{component.label}</div>
                                <input
                                    type="text"
                                    value={editingValues[component.label] !== undefined
                                        ? editingValues[component.label]
                                        : component.value.toString()}
                                    onChange={(e) => handleInputChange(component.label, e.target.value)}
                                    onBlur={(e) => handleInputBlur(component.label, e.target.value)}
                                    onKeyDown={(e) => handleInputKeyDown(e, component.label, e.currentTarget.value)}
                                    className="w-full text-sm text-center border-none outline-none ring-none"
                                    placeholder={component.value.toString()}
                                />
                                {component.unit && (
                                    <div className="text-xs text-gray-400">{component.unit}</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={handleCopyColor}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                    </button>
                </div>
                {isPickerVisible && (
                    <BasicColorPicker
                        color={color}
                        onChange={onChange}
                        onClose={() => onPickerToggle ? onPickerToggle(false) : setInternalShowPicker(false)}
                        className="absolute top-full left-0 mt-2 z-50 w-80"
                    />
                )}
            </div>
        </div>
    );
};