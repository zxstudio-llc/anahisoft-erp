import { Head, useForm } from '@inertiajs/react';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HexColorPicker } from 'react-colorful';
import { useEffect, useState, FormEvent, useMemo, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, PlusIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner"
import { CustomColorInput } from '@/components/app/color-picker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialLink {
    platform: string;
    url: string;
}

interface AnalyticsItem {
    name: string;
    description: string;
    tag: string;
    position: 'head' | 'footer';
    [key: string]: string;
}

interface MetadataItem {
    key: string;
    value: string;
}

interface SettingsData {
    site_name: string;
    site_description: string;
    logo: File | null;
    favicon: File | null;
    support_email: string;
    support_phone: string;
    primary_color: string;
    secondary_color: string;
    analytics_data: AnalyticsItem[];
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    seo_metadata: MetadataItem[];
    social_links: string;
    [key: string]: unknown;
}

interface SettingsProps {
    settings: {
        site_name?: string;
        site_description?: string;
        support_email?: string;
        support_phone?: string;
        primary_color?: string;
        secondary_color?: string;
        analytics_data?: AnalyticsItem[];
        seo_title?: string;
        seo_description?: string;
        seo_keywords?: string;
        seo_metadata?: MetadataItem[];
        social_links?: SocialLink[];
        logo_url?: string;
        favicon_url?: string;
    };
}


export default function SettingsEdit({ settings }: SettingsProps) {
    const initialData: SettingsData = {
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        logo: null,
        favicon: null,
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        primary_color: settings.primary_color || '#3b82f6',
        secondary_color: settings.secondary_color || '#10b981',
        analytics_data: settings.analytics_data || [],
        seo_title: settings.seo_title || '',
        seo_description: settings.seo_description || '',
        seo_keywords: settings.seo_keywords || '',
        seo_metadata: settings.seo_metadata || [],
        social_links: settings.social_links || [],
    };

    const defaultAnalyticsItem = {
        name: 'Default Script',
        description: 'Script de ejemplo para tracking',
        tag: '<script>console.log("Analytics loaded")</script>',
        position: 'head',
    };


    type SettingsFormData = {
        [key: string]: any;
    };
    const { data, setData, post, processing, errors } = useForm<SettingsFormData>(initialData as SettingsFormData);

    const [primaryColor, setPrimaryColor] = useState<string | null>(settings.primary_color || null);
    const [secondaryColor, setSecondaryColor] = useState<string | null>(settings.secondary_color || null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
        settings.social_links || [{ platform: 'facebook', url: '' }]
    );
    const [analyticsItems, setAnalyticsItems] = useState<AnalyticsItem[]>(
        settings.analytics_data && settings.analytics_data.length > 0
            ? settings.analytics_data
            : [defaultAnalyticsItem]
    );
    const [metadataItems, setMetadataItems] = useState<MetadataItem[]>(settings.seo_metadata || []);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url || null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.favicon_url || null);

    const requiredFields = {
        application: ['site_name', 'site_description', 'support_email', 'support_phone', 'logo', 'favicon'],
        analytics: ['analytics_data'],
        seo: ['seo_title', 'seo_description', 'seo_keywords'],
        social: []
    };

    const getMissingFields = () => {
        const missingFields: Record<string, string[]> = {
            application: [],
            analytics: [],
            seo: [],
            social: []
        };

        // Validación para Application
        if (!data.site_name) missingFields.application.push('Site Name');
        if (!data.site_description) missingFields.application.push('Site Description');
        if (!data.support_email) missingFields.application.push('Support Email');
        if (!data.support_phone) missingFields.application.push('Support Phone');
        if (!logoPreview && !settings.logo_path) missingFields.application.push('Logo');
        if (!faviconPreview && !settings.favicon_path) missingFields.application.push('Favicon');

        // Validación para Analytics
        if (!data.analytics_data || data.analytics_data.length === 0) {
            missingFields.analytics.push('At least one analytics script');
        }

        // Validación para SEO
        if (!data.seo_title) missingFields.seo.push('SEO Title');
        if (!data.seo_description) missingFields.seo.push('SEO Description');
        if (!data.seo_keywords) missingFields.seo.push('SEO Keywords');

        // Validación para Social (aunque no sea requerido, verificamos si hay datos)
        if (socialLinks.length > 0) {
            const invalidLinks = socialLinks.filter(link =>
                !link.platform || !link.url || !isValidUrl(link.url)
            );
            if (invalidLinks.length > 0) {
                missingFields.social.push('Invalid Social Links');
            }
        }

        return missingFields;
    };

    // Función auxiliar para validar URLs
    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };
    // Efectos mejorados con dependencias explícitas
    useEffect(() => {
        setData('social_links', socialLinks);
    }, [socialLinks, setData]);

    useEffect(() => {
        setData('analytics_data', analyticsItems);
    }, [analyticsItems, setData]);

    useEffect(() => {
        setData('seo_metadata', metadataItems);
    }, [metadataItems, setData]);

    useEffect(() => {
        const isValid = analyticsItems.every(item =>
            item.name && item.description && item.tag && item.position
        );
        setData('analytics_data', isValid ? analyticsItems : []);
    }, [analyticsItems, setData]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const missingFields = getMissingFields();
        const totalMissing = Object.values(missingFields).flat().length;

        if (totalMissing > 0) {
            toast.error(
                <div className="flex flex-col gap-1">
                    <div className="font-bold">Faltan {totalMissing} campos requeridos:</div>
                    {Object.entries(missingFields).map(([tab, fields]) => (
                        fields.length > 0 && (
                            <div key={tab}>
                                <span className="font-medium capitalize">{tab}:</span> {fields.join(', ')}
                            </div>
                        )
                    ))}
                </div>,
                {
                    duration: 10000,
                    position: 'top-center',
                }
            );
            return;
        }

        post(route('admin.settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato de logo inválido. Usa PNG, JPEG o SVG.');
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.error('El logo no debe superar 1MB.');
            return;
        }

        const img = new Image();
        img.onload = () => {
            if (img.width < 100 || img.height < 30) {
                toast.error('El logo es muy pequeño (mínimo 100x30px).');
            } else if (img.width > 600 || img.height > 200) {
                toast.error('El logo es muy grande (máximo 600x200px).');
            } else {
                setData('logo', file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        img.onerror = () => toast.error('No se pudo leer la imagen del logo.');
        img.src = URL.createObjectURL(file);
    };


    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato de favicon inválido. Usa ICO, PNG o SVG.');
            return;
        }

        if (file.size > 512 * 1024) {
            toast.error('El favicon no debe superar 512KB.');
            return;
        }

        const img = new Image();
        img.onload = () => {
            if (img.width < 16 || img.height < 16) {
                toast.error('El favicon es muy pequeño (mínimo 16x16px).');
            } else if (img.width > 180 || img.height > 180) {
                toast.error('El favicon es muy grande (máximo 180x180px).');
            } else {
                setData('favicon', file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFaviconPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        img.onerror = () => toast.error('No se pudo leer la imagen del favicon.');
        img.src = URL.createObjectURL(file);
    };


    // Handlers reutilizables
    const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index][field] = value;
        setSocialLinks(newLinks);
    };

    const handleAnalyticsChange = (index: number, field: keyof AnalyticsItem, value: string) => {
        const newItems = [...analyticsItems];
        if (field === 'position') {
            newItems[index][field] = value as 'head' | 'footer';
        } else {
            newItems[index][field] = value;
        }
        setAnalyticsItems(newItems);
    };

    const handleMetadataChange = (index: number, field: keyof MetadataItem, value: string) => {
        const newMeta = [...metadataItems];
        newMeta[index][field] = value;
        setMetadataItems(newMeta);
    };

    const TabWithValidation = ({
        value,
        children
    }: {
        value: string;
        children: React.ReactNode
    }) => {
        const missingFields = getMissingFields();
        const fieldsForTab = requiredFields[value as keyof typeof requiredFields] || [];
        const missingForTab = missingFields[value as keyof typeof missingFields] || [];

        // Determinar si mostrar indicadores
        const showError = missingForTab.length > 0;
        const showCheck = fieldsForTab.length > 0 && missingForTab.length === 0;

        return (
            <div className="flex items-center justify-between gap-4">
                <TabsTrigger value={value}>
                    {children}
                    {showError && (
                        <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center">
                            !
                        </Badge>
                    )}
                    {showCheck && (
                        <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center text-green-500 border-green-500">
                            ✓
                        </Badge>
                    )}
                </TabsTrigger>
            </div>
        );
    };

    // Componentes reutilizables
    const ColorPickerCard = () => (
        <div className="flex flex-col gap-4">
            <div>
            <Card>
                <CardHeader>
                    <CardTitle>Color Picker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 w-full">
                    <CustomColorInput
                        label="Color Principal"
                        color={primaryColor}
                        onChange={setPrimaryColor}
                        className="bg-transparent"
                    />
                    <CustomColorInput
                        label="Color secondary"
                        color={secondaryColor}
                        onChange={setSecondaryColor}
                        className="bg-transparent"
                    />
                </CardContent>
            </Card>
            </div>
            <div className="flex gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Favicon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {faviconPreview && (
                            <img
                                src={faviconPreview}
                                alt="Favicon preview"
                                className="w-full h-full object-contain"
                            />
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Logo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {logoPreview && (
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-full h-full object-contain"
                            />

                        )}
                    </CardContent>
                </Card>
            </div>

        </div>

    );

    return (
        <AppLayout>
            <Head title="Configuración del Sitio" />
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-2xl font-bold mb-6">Configuración del Sitio</h1>
                        <p className="text-muted-foreground">
                            Configura la información del sitio web
                        </p>
                    </div>
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        <Tabs defaultValue="application" className="w-full">
                            <div className="flex justify-between">
                                <TabsList className="grid grid-cols-4">
                                    <TabWithValidation value="application">Application</TabWithValidation>
                                    <TabWithValidation value="analytics">Analytics</TabWithValidation>
                                    <TabWithValidation value="seo">SEO</TabWithValidation>
                                    <TabWithValidation value="social">Social Networks</TabWithValidation>
                                </TabsList>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>

                            <TabsContent value="application" className="space-y-4">
                                <div className="flex gap-4 w-full justify-between">
                                    <Card className="w-6/9">
                                        <CardHeader>
                                            <CardTitle>General Settings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <Label htmlFor="site_name">Site Name <span className="text-red-500">*</span> </Label>
                                                    <Input
                                                        id="site_name"
                                                        value={data.site_name}
                                                        onChange={(e) => setData('site_name', e.target.value)}
                                                    />
                                                    {errors.site_name && <p className="text-sm text-red-500">{errors.site_name}</p>}
                                                </div>
                                                <div>
                                                    <Label htmlFor="site_description">Site Description <span className="text-red-500">*</span> </Label>
                                                    <Textarea
                                                        id="site_description"
                                                        value={data.site_description}
                                                        onChange={(e) => setData('site_description', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="logo">Logo <span className="text-red-500">*</span> </Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Input
                                                                id="logo"
                                                                type="file"
                                                                accept="image/png, image/jpeg, image/svg+xml"
                                                                onChange={handleLogoChange}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <Button type="button" variant="outline" className="w-full">
                                                                Seleccionar Logo
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Formatos recomendados: PNG, JPG, SVG. Tamaño máximo: 2MB
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label htmlFor="favicon">Favicon <span className="text-red-500">*</span> </Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Input
                                                                id="favicon"
                                                                type="file"
                                                                accept="image/png, image/x-icon, image/svg+xml"
                                                                onChange={handleFaviconChange}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <Button type="button" variant="outline" className="w-full">
                                                                Seleccionar Favicon
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Formatos recomendados: PNG, ICO, SVG. Tamaño recomendado: 32x32px
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="support_email">Support Email <span className="text-red-500">*</span> </Label>
                                                    <Input
                                                        id="support_email"
                                                        type="email"
                                                        value={data.support_email}
                                                        onChange={(e) => setData('support_email', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="support_phone">Support Phone <span className="text-red-500">*</span> </Label>
                                                    <Input
                                                        id="support_phone"
                                                        value={data.support_phone}
                                                        onChange={(e) => setData('support_phone', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <div className="w-3/9">
                                        <ColorPickerCard />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="analytics" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>Analytics Scripts</CardTitle>
                                                {analyticsItems.length === 1 && (
                                                    <p className="text-sm text-red-500">Debes agregar al menos un script de analytics</p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setAnalyticsItems([...analyticsItems, {
                                                    name: '',
                                                    description: '',
                                                    tag: '',
                                                    position: 'head'
                                                }])}
                                            >
                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                Add Script
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analyticsItems.map((item, i) => (
                                            <div key={i} className="space-y-4 p-4 border rounded-lg">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        placeholder="Name"
                                                        value={item.name}
                                                        onChange={(e) => handleAnalyticsChange(i, 'name', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder="Description"
                                                        value={item.description}
                                                        onChange={(e) => handleAnalyticsChange(i, 'description', e.target.value)}
                                                    />
                                                </div>

                                                <select
                                                    value={item.position}
                                                    onChange={(e) => handleAnalyticsChange(i, 'position', e.target.value as 'head' | 'footer')}
                                                    className="w-full p-2 border rounded"
                                                >
                                                    <option value="head">Head</option>
                                                    <option value="footer">Footer</option>
                                                </select>

                                                <Textarea
                                                    placeholder="<script>...</script>"
                                                    value={item.tag}
                                                    onChange={(e) => handleAnalyticsChange(i, 'tag', e.target.value)}
                                                    className="font-mono text-sm"
                                                />

                                                {analyticsItems.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setAnalyticsItems(analyticsItems.filter((_, index) => index !== i));
                                                        }}
                                                    >
                                                        <XIcon className="w-4 h-4 mr-2" />
                                                        Remove Script
                                                    </Button>
                                                )}



                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="seo" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>SEO Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex gap-4">

                                            <div className="w-2/3 space-y-4">
                                                <h3 className="font-medium">SEO data</h3>
                                                {/* Basic SEO Fields */}
                                                <div className="space-y-4">
                                                    <Input
                                                        placeholder="SEO Title"
                                                        value={data.seo_title}
                                                        onChange={(e) => setData('seo_title', e.target.value)}
                                                        required
                                                    />

                                                    <div>
                                                        <Textarea
                                                            placeholder="SEO Description"
                                                            value={data.seo_description}
                                                            onChange={(e) => setData('seo_description', e.target.value)}
                                                            maxLength={160}
                                                            required
                                                        />
                                                        <p className="text-sm text-muted-foreground">
                                                            {data.seo_description.length}/160 characters
                                                        </p>
                                                    </div>

                                                    <Input
                                                        placeholder="Keywords (comma separated)"
                                                        value={data.seo_keywords}
                                                        onChange={(e) => setData('seo_keywords', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                {/* Metadata Tags Section */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <Label>Metadata Tags</Label>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setMetadataItems([...metadataItems, { key: '', value: '' }])}
                                                        >
                                                            <PlusIcon className="w-4 h-4 mr-2" />
                                                            Añadir Metadata
                                                        </Button>
                                                    </div>
                                                    {metadataItems.map((item, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            <Select
                                                                value={item.key}
                                                                onValueChange={(value) => handleMetadataChange(i, 'key', value)}
                                                            >
                                                                <SelectTrigger className="w-3/7">
                                                                    <SelectValue placeholder="Selecciona una meta tag" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="og:title">Título para Redes Sociales (og:title)</SelectItem>
                                                                    <SelectItem value="og:description">Descripción para Redes Sociales (og:description)</SelectItem>
                                                                    <SelectItem value="og:site_name">Título WebSite (og:site_name)</SelectItem>
                                                                    <SelectItem value="og:locale">Localidad (og:locale) ejemplo: en_US</SelectItem>
                                                                    <SelectItem value="twitter:card">Tarjeta de Twitter (twitter:card)</SelectItem>
                                                                    <SelectItem value="og:image">Imagen para Redes Sociales (og:image)</SelectItem>
                                                                    <SelectItem value="og:image:height">Alto de Imagen (og:image:height)</SelectItem>
                                                                    <SelectItem value="og:image:width">Ancho de Imagen (og:image:width)</SelectItem>
                                                                    <SelectItem value="og:image:type">Tipo de imagen (og:image:type)</SelectItem>
                                                                    <SelectItem value="twitter:site">Usuario Twitter (twitter:site)</SelectItem>
                                                                    <SelectItem value="twitter:title">Título de Twitter (twitter:title)</SelectItem>
                                                                    <SelectItem value="twitter:description">Descripción de Twitter (twitter:description)</SelectItem>
                                                                    <SelectItem value="twitter:image">Imagen de Twitter (twitter:image)</SelectItem>
                                                                    <SelectItem value="twitter:image:height">Alto de Imagen Twitter (twitter:image:height)</SelectItem>
                                                                    <SelectItem value="twitter:image:width">Ancho de Imagen Twitter (twitter:image:width)</SelectItem>
                                                                    <SelectItem value="robots">Directiva de Indexación (robots)</SelectItem>
                                                                </SelectContent>
                                                            </Select>

                                                            <Input
                                                                placeholder="Valor"
                                                                value={item.value}
                                                                onChange={(e) => handleMetadataChange(i, 'value', e.target.value)}
                                                                className="flex-1 w-4/7"
                                                            />

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    setMetadataItems(metadataItems.filter((_, index) => index !== i))
                                                                }
                                                            >
                                                                <XIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                            {/* SEO Preview Section */}
                                            <div className="space-y-4 w-1/3">
                                                <h3 className="font-medium">SEO Preview</h3>

                                                {/* Google Preview */}
                                                <div className="border rounded p-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Google Preview</h4>
                                                    <div className="space-y-1">
                                                        <p className="text-blue-700 text-lg font-medium truncate w-full">
                                                            {data.seo_title || "Your page title appears here"}
                                                        </p>
                                                        <p className="text-green-700 text-sm">
                                                            {typeof window !== 'undefined' ? window.location.origin : 'https://yourwebsite.com'}
                                                        </p>
                                                        <p className="text-gray-600 text-sm">
                                                            {data.seo_description || "Your meta description will appear here. Keep it under 160 characters."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Social Media Preview */}
                                                <div className="border rounded p-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Social Media Preview</h4>
                                                    <div className="bg-gray-100 p-4 rounded max-w-md">
                                                        <div className="bg-white border rounded overflow-hidden">
                                                            {/* Preview Image - You could add actual image preview if available */}
                                                            <div className="bg-gray-200 h-40 w-full flex items-center justify-center">
                                                                {metadataItems.find(item => item.key === 'og:image')?.value ? (
                                                                    <img
                                                                        src={metadataItems.find(item => item.key === 'og:image')?.value}
                                                                        alt="Social preview"
                                                                        className="object-cover h-full w-full"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-500">Image preview will appear here</span>
                                                                )}
                                                            </div>
                                                            <div className="p-3">
                                                                <p className="font-medium text-gray-900">
                                                                    {metadataItems.find(item => item.key === 'og:title')?.value || data.seo_title || "Your title"}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                    {metadataItems.find(item => item.key === 'og:description')?.value ||
                                                                        data.seo_description ||
                                                                        "Your description will appear here"}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {typeof window !== 'undefined' ? window.location.origin : 'https://yourwebsite.com'}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {metadataItems.find(item => item.key === 'og:site_name')?.value || "your web name"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="social" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Social Networks</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {socialLinks.map((link, i) => {
                                            const isInvalid = !link.url || !isValidUrl(link.url);

                                            return (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <Select
                                                        value={link.platform}
                                                        onValueChange={(value) => handleSocialLinkChange(i, 'platform', value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Plataforma" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="facebook">Facebook</SelectItem>
                                                            <SelectItem value="twitter">Twitter</SelectItem>
                                                            <SelectItem value="instagram">Instagram</SelectItem>
                                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                            <SelectItem value="youtube">YouTube</SelectItem>
                                                            <SelectItem value="tiktok">TikTok</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        value={link.url}
                                                        placeholder="https://..."
                                                        onChange={(e) => handleSocialLinkChange(i, 'url', e.target.value)}
                                                        className={`flex-2 ${isInvalid ? 'border-red-500' : ''}`}
                                                    />

                                                    {isInvalid && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-red-500 text-sm">!</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>URL inválida</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {socialLinks.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setSocialLinks(socialLinks.filter((_, index) => index !== i))
                                                            }
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }])}
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Add Social Network
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}