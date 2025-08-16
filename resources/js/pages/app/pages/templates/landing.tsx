import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TrashIcon, Link as LinkIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { TemplateComponentProps } from "@/types/templates";
import { Link, usePage } from "@inertiajs/react";
import { BannerSelector } from "@/pages/app/pages/partial/banner-selector";
import { Banner } from '@/data/bannerSchema';
import { News } from '@/data/newsSchema';
import { NewsSelector } from '../partial/news-selector';
import { TestimonialSelector } from '../partial/testimonial-selector';

interface Testimonial {
  id: number;
  name: string;
  message: string;
  position?: string;
  photo?: string;
}

interface LandingTemplateData {
  hero: Array<{
    hero_type: 'single' | 'slider';
    heroTitle?: string;
    heroSubtitle?: string;
    heroButtonText?: string;
    heroButtonLink?: string;
    banners?: Array<{ banner_id: number | null }>;
  }>;
  features: Array<{
    Title: string;
    Description: string;
    feature_items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  }>;
  testimonials: Array<{
    testimonial_id: number | null;
  }>;
  highlights: Array<{
    title: string;
    description: string;
    highlights_items: Array<{
      title: string;
      description: string;
    }>;
  }>;
  pricing: Array<{
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonLink: string;
  }>;
  news: Array<{
    news_id: number | null;
  }>;
  content?: string;
}

export function LandingConfig({ data, onChange, errors }: TemplateComponentProps) {
  const [heroType, setHeroType] = useState<'simple' | 'slider'>(data.hero?.[0]?.hero_type === 'single' ? 'simple' : 'slider');
  const { banners = [] } = usePage().props as { banners?: Array<{ id: number; title?: string }> };
  const { testimonials = [] } = usePage().props as { testimonials?: Array<Testimonial> };
  const { news = [] } = usePage().props as { news?: Array<{ id: number; title?: string }> };
  const [openBanners, setOpenBanners] = useState<Record<number, boolean>>({});
  const [openTestimonials, setOpenTestimonials] = useState<Record<number, boolean>>({});
  const [openNews, setOpenNews] = useState<Record<number, boolean>>({});
  const [openComponents, setOpenComponents] = useState<Record<string, boolean>>({
    hero: true,
    features: true,
    testimonials: false,
    highlights: false,
    cta: false,
    pricing: false,
    news: false
  });

  const handleHeroTypeChange = (type: 'simple' | 'slider') => {
    // Create a new template data object with the new structure
    const newTemplateData: LandingTemplateData = {
      hero: [{
        hero_type: type === 'simple' ? 'single' : 'slider',
        ...(type === 'simple' ? {
          heroTitle: data.hero?.[0]?.heroTitle || '',
          heroSubtitle: data.hero?.[0]?.heroSubtitle || '',
          heroButtonText: data.hero?.[0]?.heroButtonText || '',
          heroButtonLink: data.hero?.[0]?.heroButtonLink || '',
        } : {
          banners: (data.hero?.[0]?.banners || []).map((banner: { banner_id: number | null }) => ({
            banner_id: banner.banner_id
          }))
        })
      }],
      features: data.features || [],
      testimonials: data.testimonials || [],
      highlights: data.highlights || [],
      pricing: data.pricing || [],
      news: data.news || [],
      content: data.content || '',
    };
  
    // Update the state with the new structure
    onChange(newTemplateData);
    setHeroType(type);
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...data };
    
    if (field.startsWith('hero')) {
      // Update hero fields
      newData.hero = [{
        ...newData.hero?.[0] || {},
        [field]: value
      }];
    } else if (field === 'banners') {
      // For banners, update within hero array
      newData.hero = [{
        ...newData.hero?.[0] || {},
        hero_type: 'slider',
        banners: value.map((banner: any) => ({
          banner_id: banner.banner_id
        }))
      }];
    } else {
      // Update other fields
      newData[field] = value;
    }
    
    onChange(newData);
  };

  const toggleTestimonials = (index: number) => {
    setOpenTestimonials((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleNews = (index: number) => {
    setOpenNews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleBanner = (index: number) => {
    setOpenBanners((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleComponent = (component: string) => {
    setOpenComponents((prev) => ({
      ...prev,
      [component]: !prev[component],
    }));
  };

  const handleCreateBanner = async (bannerData: Omit<Banner, 'id'>) => {
    const formData = new FormData();
    Object.entries(bannerData).forEach(([key, value]) => {
      if (key !== 'is_active' && value !== null) {
        formData.append(key, value as any);
      }
    });
    formData.append('is_active', bannerData.is_active ? '1' : '0');

    const response = await fetch('/admin/banners', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) throw new Error('Error creating banner');

    const responseData = await response.json();
    return responseData.id;
  };

  const addBanner = () => {
    const currentBanners = data.hero?.[0]?.banners || [];
    updateField('banners', [
      ...currentBanners,
      { banner_id: null }
    ]);
  };

  const updateBanner = (index: number, field: string, value: any) => {
    const banners = [...(data.hero?.[0]?.banners || [])];
    banners[index] = { ...banners[index], [field]: value };
    updateField('banners', banners);
  };

  const removeBanner = (index: number) => {
    const banners = (data.hero?.[0]?.banners || []).filter((_: any, i: number) => i !== index);
    updateField('banners', banners);
  };

  const addFeature = () => {
    const currentFeatures = data.features || [];
    updateField('features', [
      ...currentFeatures,
      {
        Title: '',
        Description: '',
        feature_items: []
      }
    ]);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const features = [...(data.features || [])];
    features[index] = { ...features[index], [field]: value };
    updateField('features', features);
  };

  const addTestimonial = () => {
    const currentTestimonials = data.testimonials || [];
    updateField('testimonials', [
      ...currentTestimonials,
      { name: '', role: '', content: '', avatar: '' }
    ]);
  };

  const updateTestimonial = (index: number, field: string, value: string | number | null) => {
    const testimonials = [...(data.testimonials || [])];
    testimonials[index] = { ...testimonials[index], [field]: value };
    updateField('testimonials', testimonials);
  };

  const removeTestimonial = (index: number) => {
    const testimonials = (data.testimonials || []).filter((_: any, i: number) => i !== index);
    updateField('testimonials', testimonials);
  };

  const handleCreateTestimonial = async (testimonialData: any) => {
    const formData = new FormData();

    formData.append('name', testimonialData.name);
    formData.append('position', testimonialData.position || '');
    formData.append('message', testimonialData.message);
    formData.append('is_active', '1');

    if (testimonialData.photo) {
      formData.append('photo', testimonialData.photo);
    }

    const response = await fetch('/admin/testimonials', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) throw new Error('Error al crear testimonio');

    const responseData = await response.json();
    return responseData.id;
  };

  const addNews = () => {
    const current = data.news || [];
    updateField('news', [...current, { news_id: null }]);
  };

  const updateNews = (index: number, field: string, value: any) => {
    const updated = [...(data.news || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('news', updated);
  };

  const removeNews = (index: number) => {
    const updated = (data.news || []).filter((_: any, i: number) => i !== index);
    updateField('news', updated);
  };

  const handleCreateNews = async (newsData: FormData) => {
    const response = await fetch('/admin/news', {
      method: 'POST',
      body: newsData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) throw new Error('Error al crear noticia');

    const responseData = await response.json();
    return responseData.id;
  };

  const addHighlight = () => {
    const currentHighlights = data.highlights || [];
    if (currentHighlights.length === 0) {
      updateField('highlights', [{
        title: '',
        description: '',
        highlights_items: []
      }]);
    }
  };

  const addHighlightItem = (highlightIndex: number) => {
    const highlights = [...(data.highlights || [])];
    highlights[highlightIndex].highlights_items = [
      ...(highlights[highlightIndex].highlights_items || []),
      { title: '', description: '' }
    ];
    updateField('highlights', highlights);
  };

  const updateHighlightItem = (highlightIndex: number, itemIndex: number, field: string, value: string) => {
    const highlights = [...(data.highlights || [])];
    highlights[highlightIndex].highlights_items[itemIndex] = {
      ...highlights[highlightIndex].highlights_items[itemIndex],
      [field]: value
    };
    updateField('highlights', highlights);
  };

  const removeHighlightItem = (highlightIndex: number, itemIndex: number) => {
    const highlights = [...(data.highlights || [])];
    highlights[highlightIndex].highlights_items = highlights[highlightIndex].highlights_items.filter((_: any, i: number) => i !== itemIndex);
    updateField('highlights', highlights);
  };

  const updateHighlight = (index: number, field: string, value: string) => {
    const highlights = [...(data.highlights || [])];
    highlights[index] = { ...highlights[index], [field]: value };
    updateField('highlights', highlights);
  };

  const removeHighlight = (index: number) => {
    const highlights = (data.highlights || []).filter((_: any, i: number) => i !== index);
    updateField('highlights', highlights);
  };

  const addPricing = () => {
    const currentPricing = data.pricing || [];
    updateField('pricing', [
      ...currentPricing,
      { title: '', price: '', description: '', features: [], buttonText: '', buttonLink: '' }
    ]);
  };

  const updatePricing = (index: number, field: string, value: any) => {
    const pricing = [...(data.pricing || [])];
    pricing[index] = { ...pricing[index], [field]: value };
    updateField('pricing', pricing);
  };

  const removePricing = (index: number) => {
    const pricing = (data.pricing || []).filter((_: any, i: number) => i !== index);
    updateField('pricing', pricing);
  };

  const removeFeature = (index: number) => {
    const features = (data.features || []).filter((_: any, i: number) => i !== index);
    updateField('features', features);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sección Principal</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={openComponents.hero}
                onCheckedChange={() => toggleComponent('hero')}
              />
              <Label>{openComponents.hero ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>
        {openComponents.hero && (
          <CardContent className="space-y-4">
            {/* Selector de tipo */}
            <div className="space-y-2">
              <Label>Tipo de Sección</Label>
              <select
                value={heroType}
                onChange={(e) => handleHeroTypeChange(e.target.value as 'simple' | 'slider')}
                className="w-full p-2 border rounded-md"
              >
                <option value="simple">Hero Simple</option>
                <option value="slider">Slider/Carrusel</option>
              </select>
            </div>

            {heroType === 'simple' ? (
              <>
                {/* Configuración Hero Simple */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título Principal</Label>
                    <Input
                      value={data.hero?.[0]?.heroTitle || ''}
                      onChange={(e) => updateField('heroTitle', e.target.value)}
                      placeholder="Título principal del hero"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={data.hero?.[0]?.heroSubtitle || ''}
                      onChange={(e) => updateField('heroSubtitle', e.target.value)}
                      placeholder="Subtítulo del hero"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Texto del Botón</Label>
                  <Input
                    value={data.hero?.[0]?.heroButtonText || ''}
                    onChange={(e) => updateField('heroButtonText', e.target.value)}
                    placeholder="Texto del botón principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enlace del Botón</Label>
                  <Input
                    value={data.hero?.[0]?.heroButtonLink || ''}
                    onChange={(e) => updateField('heroButtonLink', e.target.value)}
                    placeholder="URL del botón principal"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Configuración Slider/Carrusel */}
                <div className="flex items-center gap-2">
                  <Link href="/admin/banners" className="text-sm flex items-center text-primary">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Administrar Banners
                  </Link>

                  <Button type="button" onClick={addBanner} size="sm">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Banner
                  </Button>
                </div>

                {(data.hero?.[0]?.banners || []).map((banner: any, index: number) => {
                  const isOpen = openBanners[index] ?? true;
                  return (
                    <Card key={index} className="p-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Banner {index + 1}</Badge>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleBanner(index);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeBanner(index);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                          <div className="space-y-2">
                            <BannerSelector
                              banners={banners}
                              value={banner.banner_id}
                              onChange={(id) => updateBanner(index, 'banner_id', id)}
                              onCreateNew={handleCreateBanner}
                            />
                            <p className="text-xs text-gray-500">
                              Ingresa el ID de un banner existente o deja vacío para crear uno nuevo
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {(!data.hero?.[0]?.banners || data.hero?.[0]?.banners.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay banners configurados</p>
                    <p className="text-sm">Haz clic en "Agregar Banner" para comenzar</p>
                    <p className="text-sm mt-2">
                      O <Link href="/admin/banners" className="text-primary">administra tus banners existentes</Link>
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Características Destacadas</CardTitle>
            <div className="flex items-center gap-2">
              {openComponents.features && (
                <Button type="button" onClick={addFeature} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Característica
                </Button>
              )}
              <Switch
                checked={openComponents.features}
                onCheckedChange={() => toggleComponent('features')}
              />
              <Label>{openComponents.features ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>

        {openComponents.features && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título de Sección</Label>
              <Input
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Título para la sección de características"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción de Sección</Label>
              <Textarea
                value={data.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descripción para la sección de características"
                rows={3}
              />
            </div>

            {(data.features || []).map((feature: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline">Sección de Características {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>Título de Sección</Label>
                    <Input
                      value={feature.Title || ''}
                      onChange={(e) => updateFeature(index, 'Title', e.target.value)}
                      placeholder="Título de la sección"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción de Sección</Label>
                    <Textarea
                      value={feature.Description || ''}
                      onChange={(e) => updateFeature(index, 'Description', e.target.value)}
                      placeholder="Descripción de la sección"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {(!data.features || data.features.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay secciones de características configuradas</p>
                <p className="text-sm">Haz clic en "Agregar Característica" para comenzar</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Testimonials Section */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Testimonios</CardTitle>
            <div className="flex items-center gap-2">
            {openComponents.testimonials && (
                <Link href="/admin/testimonials" className="text-sm flex items-center text-primary">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Administrar Testimonios
                </Link>
              )}
              {openComponents.testimonials && (
                <Button type="button" onClick={addTestimonial} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Testimonio
                </Button>
              )}
              <Switch
                checked={openComponents.testimonials}
                onCheckedChange={() => toggleComponent('testimonials')}
              />
              <Label>{openComponents.testimonials ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>
        {openComponents.testimonials && (
          <CardContent className="space-y-4">
            {(data.testimonials || []).map((testimonial: any, index: number) => {
              const isOpen = openTestimonials[index] ?? true;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Testimonio {index + 1}</Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTestimonials(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 space-y-2">
                      <TestimonialSelector
                        testimonials={testimonials}
                        value={testimonial.testimonial_id}
                        onChange={(id) => updateTestimonial(index, "testimonial_id", id)}
                        onCreateNew={handleCreateTestimonial}
                      />
                    </div>
                  )}
                </Card>
              );
            })}

            {(!data.testimonials || data.testimonials.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay testimonios configurados</p>
                <p className="text-sm">Haz clic en "Agregar Testimonio" para comenzar</p>
                <p className="text-sm mt-2">
                  O <Link href="/admin/testimonials" className="text-primary">administra tus testimonios existentes</Link>
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Highlights Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Puntos Destacados</CardTitle>
            <div className="flex items-center gap-2">
              {openComponents.highlights && (
                <Button type="button" onClick={addHighlight} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Elemento
                </Button>
              )}
              <Switch
                checked={openComponents.highlights}
                onCheckedChange={() => toggleComponent('highlights')}
              />
              <Label>{openComponents.highlights ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>
        {openComponents.highlights && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título de Sección</Label>
              <Input
                value={data.highlights?.[0]?.title || ''}
                onChange={(e) => updateHighlight(0, 'title', e.target.value)}
                placeholder="Título para la sección de puntos destacados"
              />
            </div>
          
            <div className="space-y-2">
              <Label>Descripción de Sección</Label>
              <Textarea
                value={data.highlights?.[0]?.description || ''}
                onChange={(e) => updateHighlight(0, 'description', e.target.value)}
                placeholder="Descripción para la sección de puntos destacados"
                rows={3}
              />
            </div>
          
            {(data.highlights?.[0]?.highlights_items || []).map((item: { title: string; description: string }, index: number) => (
                    <Card className="p-4 mt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Elemento {index + 1}</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlightItem(0, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={item.title || ''}
                          onChange={(e) => updateHighlightItem(0, index, 'title', e.target.value)}
                          placeholder="Título del elemento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={item.description || ''}
                          onChange={(e) => updateHighlightItem(0, index, 'description', e.target.value)}
                          placeholder="Descripción del elemento"
                          rows={3}
                        />
                      </div>
                    </Card>
                ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addHighlightItem(0)}
              className="mt-4"
            >
              Agregar Elemento
            </Button>
          
            {(!data.highlights?.[0]?.highlights_items?.length) && (
              <div className="text-center py-4 text-gray-500">
                <p>No hay elementos configurados</p>
                <p className="text-sm">Haz clic en "Agregar Elemento" para comenzar</p>
              </div>
            )}
          </CardContent>        
        )}
      </Card>

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Planes de Precios</CardTitle>
            <div className="flex items-center gap-2">
              {openComponents.pricing && (
                <Button type="button" onClick={addPricing} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Plan
                </Button>
              )}
              <Switch
                checked={openComponents.pricing}
                onCheckedChange={() => toggleComponent('pricing')}
              />
              <Label>{openComponents.pricing ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>
        {openComponents.pricing && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título de Sección</Label>
              <Input
                value={data.pricingTitle || ''}
                onChange={(e) => updateField('pricingTitle', e.target.value)}
                placeholder="Título para la sección de precios"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción de Sección</Label>
              <Textarea
                value={data.pricingDescription || ''}
                onChange={(e) => updateField('pricingDescription', e.target.value)}
                placeholder="Descripción para la sección de precios"
                rows={3}
              />
            </div>

            {(data.pricing || []).map((plan: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline">Plan {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removePricing(index);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Título del Plan</Label>
                    <Input
                      value={plan.title || ''}
                      onChange={(e) => updatePricing(index, 'title', e.target.value)}
                      placeholder="Nombre del plan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio</Label>
                    <Input
                      value={plan.price || ''}
                      onChange={(e) => updatePricing(index, 'price', e.target.value)}
                      placeholder="Ej: $99/mes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto del Botón</Label>
                    <Input
                      value={plan.buttonText || ''}
                      onChange={(e) => updatePricing(index, 'buttonText', e.target.value)}
                      placeholder="Texto del botón"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>Descripción del Plan</Label>
                  <Textarea
                    value={plan.description || ''}
                    onChange={(e) => updatePricing(index, 'description', e.target.value)}
                    placeholder="Descripción breve del plan"
                    rows={2}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Label>Características (separadas por comas)</Label>
                  <Textarea
                    value={plan.features?.join(', ') || ''}
                    onChange={(e) => updatePricing(index, 'features', e.target.value.split(',').map(f => f.trim()))}
                    placeholder="Característica 1, Característica 2, Característica 3"
                    rows={3}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Label>Enlace del Botón</Label>
                  <Input
                    value={plan.buttonLink || ''}
                    onChange={(e) => updatePricing(index, 'buttonLink', e.target.value)}
                    placeholder="URL del botón"
                  />
                </div>
              </Card>
            ))}
            {(!data.pricing || data.pricing.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay planes de precios configurados</p>
                <p className="text-sm">Haz clic en "Agregar Plan" para comenzar</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* News Section */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Noticias Destacadas</CardTitle>
            <div className="flex items-center gap-2">
              {openComponents.news && (
                <Link href="/admin/news" className="text-sm flex items-center text-primary">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Administrar Noticias
                </Link>
              )}

              {openComponents.news && (
                <Button type="button" onClick={addNews} size="sm">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Noticia
                </Button>
              )}

              {/* Switch de control */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={openComponents.news}
                  onCheckedChange={() => toggleComponent('news')}
                  id="news-toggle"
                />
                <Label htmlFor="news-toggle">
                  {openComponents.news ? 'Mostrando' : 'Oculto'}
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        {openComponents.news && (
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {(data.news || []).map((newsItem: any, index: number) => {
                const isOpen = openNews[index] ?? true;
                return (
                  <Card key={index} className="p-4 flex-1 min-w-[300px] max-w-[calc(33.333%_-_16px)]">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Noticia {index + 1}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleNews(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNews(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-2">
                        <NewsSelector
                          news={news}
                          value={newsItem.news_id}
                          onChange={(id) => updateNews(index, "news_id", id)}
                          onCreateNew={handleCreateNews}
                          usedItems={data.news?.map((item: { news_id: any; }) => item.news_id).filter((id: any) => id !== newsItem.news_id) || []}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {(!data.news || data.news.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay noticias configuradas</p>
                <p className="text-sm">Haz clic en "Agregar Noticia" para comenzar</p>
                <p className="text-sm mt-2">
                  O <Link href="/admin/news" className="text-primary">administra tus noticias existentes</Link>
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>


      {/* CTA Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Llamado a la Acción (CTA)</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={openComponents.cta}
                onCheckedChange={() => toggleComponent('cta')}
              />
              <Label>{openComponents.cta ? 'Mostrando' : 'Oculto'}</Label>
            </div>
          </div>
        </CardHeader>
        {openComponents.cta && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={data.ctaTitle || ''}
                onChange={(e) => updateField('ctaTitle', e.target.value)}
                placeholder="Título del CTA"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={data.ctaDescription || ''}
                onChange={(e) => updateField('ctaDescription', e.target.value)}
                placeholder="Descripción del CTA"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto del Botón</Label>
                <Input
                  value={data.ctaButtonText || ''}
                  onChange={(e) => updateField('ctaButtonText', e.target.value)}
                  placeholder="Texto del botón"
                />
              </div>
              <div className="space-y-2">
                <Label>Enlace del Botón</Label>
                <Input
                  value={data.ctaButtonLink || ''}
                  onChange={(e) => updateField('ctaButtonLink', e.target.value)}
                  placeholder="URL del botón"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* HTML Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido Adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="content">Contenido HTML</Label>
            <Textarea
              id="content"
              value={data.content || ''}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Contenido adicional en HTML..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Puedes usar HTML para formatear el contenido adicional que aparecerá después del hero y características.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}