// resources/js/Pages/Admin/Themes/Edit.tsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';

const defaultColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
};

export default function ThemeEdit({ theme }: { theme?: any }) {
    const isEdit = !!theme;
    const { data, setData, post, put, processing, errors } = useForm({
        name: theme?.name || '',
        type: theme?.type || 'web',
        colors: theme?.colors || defaultColors,
        styles: theme?.styles || {},
    });

    const [activeColor, setActiveColor] = useState<string>(Object.keys(data.colors)[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.themes.update', theme.id));
        } else {
            post(route('admin.themes.store'));
        }
    };

    const addColor = () => {
        const newKey = `color_${Object.keys(data.colors).length + 1}`;
        setData('colors', {
            ...data.colors,
            [newKey]: '#000000'
        });
        setActiveColor(newKey);
    };

    const removeColor = (key: string) => {
        const newColors = { ...data.colors };
        delete newColors[key];
        setData('colors', newColors);
        setActiveColor(Object.keys(newColors)[0]);
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? `Editando Tema: ${theme.name}` : 'Crear Nuevo Tema'}
            </h1>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="name">Nombre del Tema</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        
                        <div>
                            <Label htmlFor="type">Tipo</Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md mt-1"
                                required
                            >
                                <option value="web">Web Pública</option>
                                <option value="dashboard">Dashboard Admin</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Colores del Tema</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-4">
                            {Object.entries(data.colors).map(([key, value]) => (
                                <div 
                                    key={key}
                                    onClick={() => setActiveColor(key)}
                                    className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                                        activeColor === key ? 'border-gray-900' : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: value }}
                                    title={`${key}: ${value}`}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={addColor}
                                className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-gray-500 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Nombre del Color</Label>
                                <Input
                                    value={activeColor}
                                    onChange={(e) => {
                                        const newColors = { ...data.colors };
                                        newColors[e.target.value] = newColors[activeColor];
                                        delete newColors[activeColor];
                                        setData('colors', newColors);
                                        setActiveColor(e.target.value);
                                    }}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Valor HEX</Label>
                                <div className="flex mt-1">
                                    <Input
                                        value={data.colors[activeColor]}
                                        onChange={(e) => setData('colors', {
                                            ...data.colors,
                                            [activeColor]: e.target.value
                                        })}
                                        className="rounded-r-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeColor(activeColor)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                                        disabled={Object.keys(data.colors).length <= 1}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Estilos CSS Personalizados</Label>
                        <textarea
                            value={data.styles.custom_css || ''}
                            onChange={(e) => setData('styles', {
                                ...data.styles,
                                custom_css: e.target.value
                            })}
                            className="w-full h-40 px-3 py-2 border rounded-md mt-1 font-mono text-sm"
                            placeholder=".custom-class {\n  property: value;\n}"
                        />
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="border rounded-lg p-6">
                        <Label>Selector de Color</Label>
                        <div className="mt-2">
                            <HexColorPicker
                                color={data.colors[activeColor]}
                                onChange={(color) => setData('colors', {
                                    ...data.colors,
                                    [activeColor]: color
                                })}
                                className="w-full"
                            />
                            <div className="mt-2">
                                <span className="text-sm">
                                    {activeColor}: {data.colors[activeColor]}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg p-6">
                        <h3 className="font-medium mb-4">Previsualización</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: data.colors.background }}>
                                <h4 className="font-semibold mb-2" style={{ color: data.colors.text }}>
                                    Título de Ejemplo
                                </h4>
                                <p className="text-sm mb-3" style={{ color: data.colors.text }}>
                                    Este es un texto de ejemplo que muestra cómo se vería el contenido con este tema.
                                </p>
                                <div className="flex space-x-2">
                                    <span 
                                        className="px-3 py-1 rounded-md text-sm"
                                        style={{ 
                                            backgroundColor: data.colors.primary,
                                            color: 'white'
                                        }}
                                    >
                                        Botón Primario
                                    </span>
                                    <span 
                                        className="px-3 py-1 rounded-md text-sm"
                                        style={{ 
                                            backgroundColor: data.colors.secondary,
                                            color: 'white'
                                        }}
                                    >
                                        Botón Secundario
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border" style={{ 
                                borderColor: data.colors.border,
                                backgroundColor: data.colors.background
                            }}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium" style={{ color: data.colors.text }}>
                                        Alerta de Éxito
                                    </span>
                                    <span 
                                        className="px-2 py-1 rounded-full text-xs"
                                        style={{ 
                                            backgroundColor: data.colors.success + '20',
                                            color: data.colors.success
                                        }}
                                    >
                                        Success
                                    </span>
                                </div>
                                <p className="text-sm" style={{ color: data.colors.text }}>
                                    Esta es una alerta de éxito de ejemplo.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <Button type="submit" disabled={processing} className="w-full">
                        {isEdit ? 'Actualizar Tema' : 'Crear Tema'}
                    </Button>
                </div>
            </form>
        </div>
    );
}