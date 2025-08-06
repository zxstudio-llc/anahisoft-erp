import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Footer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, PlusIcon, TrashIcon, Upload, X } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import FooterSimple from '@/components/www/Footer-simple'
import FooterBasic from '@/components/www/Footer-basic'
// import FooterStandard from '@/components/www/Footer'
import FooterAdvanced from '@/components/www/Footer-advanced'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface ManageFooterProps {
  footer: Footer | null;
  templates: Record<string, any>;
  defaultContent: any;
}

export default function ManageFooter({
  footer,
  templates,
  defaultContent
}: ManageFooterProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>((footer && (footer as any).logo_url) || null);
  const [isUploading, setIsUploading] = useState(false);

  const template = {
    simple: {
      name: 'Simple',
      description: 'Un footer limpio y minimalista.',
      preview: <FooterSimple />,
    },
    basic: {
      name: 'Basic',
      description: 'Footer con estructura básica.',
      preview: <FooterBasic />,
    },
    standard: {
      name: 'Standard',
      description: 'Estructura clásica y completa.',
      preview: "",
    },
    advanced: {
      name: 'Advanced',
      description: 'Footer moderno con newsletter y enlaces.',
      preview: <FooterAdvanced />,
    },
  }

  const SocialIcon = ({ iconName, className = '' }: { iconName: string, className?: string }) => {
    const network = SOCIAL_NETWORKS.find(n => n.value === iconName.toLowerCase());

    if (network) {
      return <i className={`${network.icon} ${className}`} />;
    }

    return <i className="ri-question-fill" />;
  };

  const SOCIAL_NETWORKS = [
    { value: 'facebook', label: 'Facebook', icon: 'ri-facebook-fill' },
    { value: 'twitter', label: 'Twitter', icon: 'ri-twitter-x-fill' },
    { value: 'instagram', label: 'Instagram', icon: 'ri-instagram-fill' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'ri-linkedin-fill' },
    { value: 'youtube', label: 'YouTube', icon: 'ri-youtube-fill' },
    { value: 'tiktok', label: 'TikTok', icon: 'ri-tiktok-fill' },
    { value: 'pinterest', label: 'Pinterest', icon: 'ri-pinterest-fill' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'ri-whatsapp-fill' },
    { value: 'telegram', label: 'Telegram', icon: 'ri-telegram-fill' },
    { value: 'reddit', label: 'Reddit', icon: 'ri-reddit-fill' },
    { value: 'discord', label: 'Discord', icon: 'ri-discord-fill' },
    { value: 'slack', label: 'Slack', icon: 'ri-slack-fill' },
    { value: 'twitch', label: 'Twitch', icon: 'ri-twitch-fill' },
    { value: 'spotify', label: 'Spotify', icon: 'ri-spotify-fill' },
    { value: 'apple', label: 'Apple', icon: 'ri-apple-fill' },
    { value: 'google', label: 'Google', icon: 'ri-google-fill' },
    { value: 'microsoft', label: 'Microsoft', icon: 'ri-microsoft-fill' },
    { value: 'github', label: 'GitHub', icon: 'ri-github-fill' },
    { value: 'gitlab', label: 'GitLab', icon: 'ri-gitlab-fill' },
  ];

  const FileUploadWithPreview = ({
    label,
    previewUrl,
    onFileChange,
    accept = 'image/png, image/jpeg, image/svg+xml',
    className = '',
  }: {
    label: string;
    previewUrl: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    className?: string;
  }) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>{label}</Label>
        <div className="flex items-center gap-4">
          {previewUrl && (
            <div className="w-16 h-16 border rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="relative">
            <Input
              type="file"
              accept={accept}
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button type="button" variant="outline">
              {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const safeTemplates = templates || {
    'template1': {
      'name': 'Plantilla Básica',
      'description': 'Footer simple con logo, enlaces y copyright',
      'default_content': {
        'logo': null,
        'about': 'Breve descripción de tu empresa',
        'links': [
          { 'text': 'Inicio', 'url': '/' },
          { 'text': 'Nosotros', 'url': '/about' },
          { 'text': 'Contacto', 'url': '/contact' },
        ],
        'social_links': [
          { 'icon': 'facebook', 'url': '#' },
          { 'icon': 'twitter', 'url': '#' },
          { 'icon': 'instagram', 'url': '#' },
        ],
        'copyright': `© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`
      }
    },
    'template2': {
      'name': 'Plantilla Avanzada',
      'description': 'Footer con múltiples columnas y newsletter',
      'default_content': {
        'columns': [
          {
            'title': 'Compañía',
            'links': [
              { 'text': 'Sobre Nosotros', 'url': '/about' },
              { 'text': 'Carreras', 'url': '/careers' },
              { 'text': 'Blog', 'url': '/blog' },
            ]
          },
          {
            'title': 'Legal',
            'links': [
              { 'text': 'Política de Privacidad', 'url': '/privacy' },
              { 'text': 'Términos de Servicio', 'url': '/terms' },
            ]
          }
        ],
        'newsletter': {
          'title': 'Suscríbete a nuestro newsletter',
          'description': 'Las últimas noticias y artículos enviados a tu inbox semanalmente.',
          'placeholder': 'Ingresa tu email',
          'button_text': 'Suscribirse'
        },
        'copyright': `© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`
      }
    }
  };

  const { data, setData, processing, errors } = useForm({
    id: footer?.id || null,
    name: footer?.name || 'Footer Principal',
    template: footer?.template || Object.keys(templates)[0] || 'simple',
    content: (() => {
      const initialContent = footer?.content || defaultContent;
      return typeof initialContent === 'object' ? initialContent : {
        copyright: `© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`,
        social_links: [],
        brands: [],
        ...(footer?.template === 'basic' && { columns: [] }),
        ...(footer?.template === 'advanced' && { rows: [], slogan: '' }),
        ...(footer?.template === 'standard' && { links: [] })
      };
    })(),
    logoFile: null,
  });

  const updateContent = (path: string, value: any) => {
    setData('content', {
      ...(typeof data.content === 'object' ? data.content : {}),
      [path]: value
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string);
          setData('logoFile', file);
        };
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => toast.error('No se pudo leer la imagen del logo.');
    img.src = URL.createObjectURL(file);
  };

  const handleBrandImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de imagen inválido. Usa PNG, JPEG o SVG.');
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error('La imagen no debe superar 1MB.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < 50 || img.height < 50) {
        toast.error('La imagen es muy pequeña (mínimo 50x50px).');
      } else if (img.width > 800 || img.height > 800) {
        toast.error('La imagen es muy grande (máximo 800x800px).');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const updatedBrands = [...(data.content?.brands || [])];
          updatedBrands[index] = {
            ...updatedBrands[index],
            image: e.target?.result as string,
            file: file
          };
          setData('content', {
            ...data.content,
            brands: updatedBrands
          });
        };
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => toast.error('No se pudo leer la imagen.');
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const contentToSend = typeof data.content === 'object' ? data.content : {};

    const formData = new FormData();

    formData.append('name', data.name || 'Footer Principal');
    formData.append('template', data.template || Object.keys(templates)[0] || 'basic');

    formData.append('content', JSON.stringify({
      ...contentToSend,
      brands: Array.isArray(contentToSend.brands)
        ? contentToSend.brands.map(brand => ({
          alt: brand?.alt || '',
          url: brand?.url || '',
          image: brand?.image || null,
          media_id: brand?.media_id || null
        }))
        : []
    }));

    if (data.logoFile) {
      formData.append('logo', data.logoFile);
    }

    if (contentToSend.brands) {
      contentToSend.brands.forEach((brand: any, index: number) => {
        if (brand?.file instanceof File) {
          formData.append(`brands[${index}]`, brand.file);
        }
      });
    }

    try {
      const response = await axios.post(
        route('admin.footers.update', footer?.id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Footer actualizado correctamente');
      router.visit(route('admin.footers.manage'), { only: ['footer'] });
    } catch (error: any) {
      console.error('Error saving footer:', error);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages: string[]) => {
          messages.forEach(message => toast.error(message));
        });
      } else {
        toast.error('Error al guardar el footer');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setData('template', templateKey);
    if (safeTemplates[templateKey]?.default_content) {
      setData('content', safeTemplates[templateKey].default_content);
    }
  };

  const renderTemplateContent = () => {
    const currentTemplate = templates[data.template];
    if (!currentTemplate) return null;

    switch (data.template) {
      case 'simple':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content.copyright">Texto de Copyright</Label>
              <Input
                id="content.copyright"
                value={data.content?.copyright || ''}
                onChange={(e) => updateContent('copyright', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadWithPreview
                label="Logo del Footer"
                previewUrl={logoPreview}
                onFileChange={handleLogoChange}
              />
            </div>

            <div>
              <Label>Redes Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data.content?.social_links?.map((social: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={social.icon || ''}
                      onValueChange={(value) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], icon: value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecciona red">
                          {social.icon ? (
                            <div className="flex items-center gap-2">
                              <SocialIcon iconName={social.icon} className="h-4 w-4" />
                              {SOCIAL_NETWORKS.find(n => n.value === social.icon)?.label || social.icon}
                            </div>
                          ) : (
                            "Selecciona red"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {SOCIAL_NETWORKS.map((network) => (
                          <SelectItem
                            key={network.value}
                            value={network.value}
                            className="flex items-center gap-2"
                          >
                            <SocialIcon iconName={network.value} className="h-4 w-4" />
                            {network.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={social.url || ''}
                      placeholder="URL"
                      onChange={(e) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], url: e.target.value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial.splice(index, 1);
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    social_links: [...(data.content?.social_links || []), { icon: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Red Social
              </Button>
            </div>

            <div>
              <Label>Marcas/Logos</Label>
              <div className="grid grid-cols-1 gap-4 mt-2">
                {data.content?.brands?.map((brand: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <div>
                        <FileUploadWithPreview
                          label=""
                          previewUrl={brand.image}
                          onFileChange={(e) => handleBrandImageChange(e, index)}
                          className="w-full"
                        />
                      </div>
                      <Input
                        value={brand.alt || ''}
                        placeholder="Texto alternativo"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], alt: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Input
                        value={brand.url || ''}
                        placeholder="URL"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], url: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands.splice(index, 1);
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    brands: [...(data.content?.brands || []), { image: null, alt: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Marca
              </Button>
            </div>
          </div>
        );

      case 'standard':
        return (
          <div className="space-y-4">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadWithPreview
                  label="Logo del Footer"
                  previewUrl={logoPreview}
                  onFileChange={handleLogoChange}
                />
              </div>

              <div>
                <Label>Redes Sociales</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {data.content?.social_links?.map((social: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={social.icon || ''}
                        onValueChange={(value) => {
                          const updatedSocial = [...(data.content?.social_links || [])];
                          updatedSocial[index] = { ...updatedSocial[index], icon: value };
                          setData('content', {
                            ...data.content,
                            social_links: updatedSocial
                          });
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Selecciona red">
                            {social.icon ? (
                              <div className="flex items-center gap-2">
                                <SocialIcon iconName={social.icon} className="h-4 w-4" />
                                {SOCIAL_NETWORKS.find(n => n.value === social.icon)?.label || social.icon}
                              </div>
                            ) : (
                              "Selecciona red"
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {SOCIAL_NETWORKS.map((network) => (
                            <SelectItem
                              key={network.value}
                              value={network.value}
                              className="flex items-center gap-2"
                            >
                              <SocialIcon iconName={network.value} className="h-4 w-4" />
                              {network.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={social.url || ''}
                        placeholder="URL"
                        onChange={(e) => {
                          const updatedSocial = [...(data.content?.social_links || [])];
                          updatedSocial[index] = { ...updatedSocial[index], url: e.target.value };
                          setData('content', {
                            ...data.content,
                            social_links: updatedSocial
                          });
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updatedSocial = [...(data.content?.social_links || [])];
                          updatedSocial.splice(index, 1);
                          setData('content', {
                            ...data.content,
                            social_links: updatedSocial
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setData('content', {
                      ...data.content,
                      social_links: [...(data.content?.social_links || []), { icon: '', url: '' }]
                    });
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Añadir Red Social
                </Button>
              </div>

              <div>
                <Label>Marcas/Logos</Label>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  {data.content?.brands?.map((brand: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <div>
                          <FileUploadWithPreview
                            label=""
                            previewUrl={brand.image}
                            onFileChange={(e) => handleBrandImageChange(e, index)}
                            className="w-full"
                          />
                        </div>
                        <Input
                          value={brand.alt || ''}
                          placeholder="Texto alternativo"
                          onChange={(e) => {
                            const updatedBrands = [...(data.content?.brands || [])];
                            updatedBrands[index] = { ...updatedBrands[index], alt: e.target.value };
                            setData('content', {
                              ...data.content,
                              brands: updatedBrands
                            });
                          }}
                        />
                        <Input
                          value={brand.url || ''}
                          placeholder="URL"
                          onChange={(e) => {
                            const updatedBrands = [...(data.content?.brands || [])];
                            updatedBrands[index] = { ...updatedBrands[index], url: e.target.value };
                            setData('content', {
                              ...data.content,
                              brands: updatedBrands
                            });
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedBrands = [...(data.content?.brands || [])];
                            updatedBrands.splice(index, 1);
                            setData('content', {
                              ...data.content,
                              brands: updatedBrands
                            });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setData('content', {
                      ...data.content,
                      brands: [...(data.content?.brands || []), { image: null, alt: '', url: '' }]
                    });
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Añadir Marca
                </Button>
              </div>
              <Label>Enlaces</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {data.content?.links?.map((link: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={link.text || ''}
                      placeholder="Texto del enlace"
                      onChange={(e) => {
                        const updatedLinks = [...(data.content?.links || [])];
                        updatedLinks[index] = { ...updatedLinks[index], text: e.target.value };
                        setData('content', {
                          ...data.content,
                          links: updatedLinks
                        });
                      }}
                    />
                    <Input
                      value={link.url || ''}
                      placeholder="URL"
                      onChange={(e) => {
                        const updatedLinks = [...(data.content?.links || [])];
                        updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                        setData('content', {
                          ...data.content,
                          links: updatedLinks
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updatedLinks = [...(data.content?.links || [])];
                        updatedLinks.splice(index, 1);
                        setData('content', {
                          ...data.content,
                          links: updatedLinks
                        });
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    links: [...(data.content?.links || []), { text: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Enlace
              </Button>
            </div>

            <div>
              <Label htmlFor="content.copyright">Texto de Copyright</Label>
              <Input
                id="content.copyright"
                value={data.content?.copyright || ''}
                onChange={(e) => setData('content', {
                  ...data.content,
                  copyright: e.target.value
                })}
              />
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6">
            <Label className="text-base font-medium">Columnas del Footer</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadWithPreview
                label="Logo del Footer"
                previewUrl={logoPreview}
                onFileChange={handleLogoChange}
              />
            </div>

            <div>
              <Label>Redes Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data.content?.social_links?.map((social: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={social.icon || ''}
                      onValueChange={(value) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], icon: value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecciona red">
                          {social.icon ? (
                            <div className="flex items-center gap-2">
                              <SocialIcon iconName={social.icon} className="h-4 w-4" />
                              {SOCIAL_NETWORKS.find(n => n.value === social.icon)?.label || social.icon}
                            </div>
                          ) : (
                            "Selecciona red"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {SOCIAL_NETWORKS.map((network) => (
                          <SelectItem
                            key={network.value}
                            value={network.value}
                            className="flex items-center gap-2"
                          >
                            <SocialIcon iconName={network.value} className="h-4 w-4" />
                            {network.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={social.url || ''}
                      placeholder="URL"
                      onChange={(e) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], url: e.target.value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial.splice(index, 1);
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    social_links: [...(data.content?.social_links || []), { icon: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Red Social
              </Button>
            </div>

            <div>
              <Label>Marcas/Logos</Label>
              <div className="grid grid-cols-1 gap-4 mt-2">
                {data.content?.brands?.map((brand: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <div>
                        <FileUploadWithPreview
                          label=""
                          previewUrl={brand.image}
                          onFileChange={(e) => handleBrandImageChange(e, index)}
                          className="w-full"
                        />
                      </div>
                      <Input
                        value={brand.alt || ''}
                        placeholder="Texto alternativo"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], alt: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Input
                        value={brand.url || ''}
                        placeholder="URL"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], url: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands.splice(index, 1);
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    brands: [...(data.content?.brands || []), { image: null, alt: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Marca
              </Button>
            </div>
            <div className="space-y-4 mt-2">
              {data.content?.columns?.map((column: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`column.${index}.title`}>Título de la Columna</Label>
                      <Input
                        id={`column.${index}.title`}
                        value={column.title || ''}
                        onChange={(e) => {
                          const updatedColumns = [...(data.content?.columns || [])];
                          updatedColumns[index] = { ...updatedColumns[index], title: e.target.value };
                          setData('content', {
                            ...data.content,
                            columns: updatedColumns
                          });
                        }}
                      />
                    </div>
                  </div>

                  <Label>Enlaces</Label>
                  <div className="space-y-2 mt-2">
                    {column.links?.map((link: any, linkIndex: number) => (
                      <div key={linkIndex} className="flex items-center space-x-2">
                        <Input
                          value={link.text || ''}
                          placeholder="Texto del enlace"
                          onChange={(e) => {
                            const updatedColumns = [...(data.content?.columns || [])];
                            updatedColumns[index].links[linkIndex] = {
                              ...updatedColumns[index].links[linkIndex],
                              text: e.target.value
                            };
                            setData('content', {
                              ...data.content,
                              columns: updatedColumns
                            });
                          }}
                        />
                        <Input
                          value={link.url || ''}
                          placeholder="URL"
                          onChange={(e) => {
                            const updatedColumns = [...(data.content?.columns || [])];
                            updatedColumns[index].links[linkIndex] = {
                              ...updatedColumns[index].links[linkIndex],
                              url: e.target.value
                            };
                            setData('content', {
                              ...data.content,
                              columns: updatedColumns
                            });
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedColumns = [...(data.content?.columns || [])];
                            updatedColumns[index].links.splice(linkIndex, 1);
                            setData('content', {
                              ...data.content,
                              columns: updatedColumns
                            });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const updatedColumns = [...(data.content?.columns || [])];
                      if (!updatedColumns[index].links) updatedColumns[index].links = [];
                      updatedColumns[index].links.push({ text: '', url: '' });
                      setData('content', {
                        ...data.content,
                        columns: updatedColumns
                      });
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Añadir Enlace
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="content.copyright">Texto de Copyright</Label>
              <Input
                id="content.copyright"
                value={data.content?.copyright || ''}
                onChange={(e) => setData('content', {
                  ...data.content,
                  copyright: e.target.value
                })}
              />
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadWithPreview
                label="Logo del Footer"
                previewUrl={logoPreview}
                onFileChange={handleLogoChange}
              />
            </div>

            <div>
              <Label>Redes Sociales</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data.content?.social_links?.map((social: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={social.icon || ''}
                      onValueChange={(value) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], icon: value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecciona red">
                          {social.icon ? (
                            <div className="flex items-center gap-2">
                              <SocialIcon iconName={social.icon} className="h-4 w-4" />
                              {SOCIAL_NETWORKS.find(n => n.value === social.icon)?.label || social.icon}
                            </div>
                          ) : (
                            "Selecciona red"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {SOCIAL_NETWORKS.map((network) => (
                          <SelectItem
                            key={network.value}
                            value={network.value}
                            className="flex items-center gap-2"
                          >
                            <SocialIcon iconName={network.value} className="h-4 w-4" />
                            {network.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={social.url || ''}
                      placeholder="URL"
                      onChange={(e) => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial[index] = { ...updatedSocial[index], url: e.target.value };
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updatedSocial = [...(data.content?.social_links || [])];
                        updatedSocial.splice(index, 1);
                        setData('content', {
                          ...data.content,
                          social_links: updatedSocial
                        });
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    social_links: [...(data.content?.social_links || []), { icon: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Red Social
              </Button>
            </div>

            <div>
              <Label>Marcas/Logos</Label>
              <div className="grid grid-cols-1 gap-4 mt-2">
                {data.content?.brands?.map((brand: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <div>
                        <FileUploadWithPreview
                          label=""
                          previewUrl={brand.image}
                          onFileChange={(e) => handleBrandImageChange(e, index)}
                          className="w-full"
                        />
                      </div>
                      <Input
                        value={brand.alt || ''}
                        placeholder="Texto alternativo"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], alt: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Input
                        value={brand.url || ''}
                        placeholder="URL"
                        onChange={(e) => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands[index] = { ...updatedBrands[index], url: e.target.value };
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updatedBrands = [...(data.content?.brands || [])];
                          updatedBrands.splice(index, 1);
                          setData('content', {
                            ...data.content,
                            brands: updatedBrands
                          });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setData('content', {
                    ...data.content,
                    brands: [...(data.content?.brands || []), { image: null, alt: '', url: '' }]
                  });
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Añadir Marca
              </Button>
            </div>
            <div>
              <Label htmlFor="content.slogan">Slogan</Label>
              <Input
                id="content.slogan"
                value={data.content?.slogan || ''}
                onChange={(e) => setData('content', {
                  ...data.content,
                  slogan: e.target.value
                })}
              />
            </div>

            <Label className="text-base font-medium">Filas del Footer</Label>
            <div className="space-y-4 mt-2">
              {data.content?.rows?.map((row: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`row.${index}.title`}>Título de la Fila</Label>
                      <Input
                        id={`row.${index}.title`}
                        value={row.title || ''}
                        onChange={(e) => {
                          const updatedRows = [...(data.content?.rows || [])];
                          updatedRows[index] = { ...updatedRows[index], title: e.target.value };
                          setData('content', {
                            ...data.content,
                            rows: updatedRows
                          });
                        }}
                      />
                    </div>
                  </div>

                  <Label>Elementos</Label>
                  <div className="space-y-2 mt-2">
                    {row.items?.map((item: any, itemIndex: number) => (
                      <div key={itemIndex} className="flex items-center space-x-2">
                        <Input
                          value={item.text || ''}
                          placeholder="Texto del elemento"
                          onChange={(e) => {
                            const updatedRows = [...(data.content?.rows || [])];
                            updatedRows[index].items[itemIndex] = {
                              ...updatedRows[index].items[itemIndex],
                              text: e.target.value
                            };
                            setData('content', {
                              ...data.content,
                              rows: updatedRows
                            });
                          }}
                        />
                        <Input
                          value={item.url || ''}
                          placeholder="URL"
                          onChange={(e) => {
                            const updatedRows = [...(data.content?.rows || [])];
                            updatedRows[index].items[itemIndex] = {
                              ...updatedRows[index].items[itemIndex],
                              url: e.target.value
                            };
                            setData('content', {
                              ...data.content,
                              rows: updatedRows
                            });
                          }}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedRows = [...(data.content?.rows || [])];
                            updatedRows[index].items.splice(itemIndex, 1);
                            setData('content', {
                              ...data.content,
                              rows: updatedRows
                            });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const updatedRows = [...(data.content?.rows || [])];
                      if (!updatedRows[index].items) updatedRows[index].items = [];
                      updatedRows[index].items.push({ text: '', url: '' });
                      setData('content', {
                        ...data.content,
                        rows: updatedRows
                      });
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Añadir Elemento
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="content.copyright">Texto de Copyright</Label>
              <Input
                id="content.copyright"
                value={data.content?.copyright || ''}
                onChange={(e) => setData('content', {
                  ...data.content,
                  copyright: e.target.value
                })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Configuración básica</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FileUploadWithPreview
                  label="Logo del Footer"
                  previewUrl={logoPreview}
                  onFileChange={handleLogoChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content.copyright">Texto de Copyright</Label>
              <Input
                id="content.copyright"
                value={data.content?.copyright || ''}
                onChange={(e) => setData('content', {
                  ...data.content,
                  copyright: e.target.value
                })}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <Head title="Gestión de Footer" />

      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-2xl font-bold mb-6">Configuración del Footer</h1>
            <p className="text-muted-foreground">
              Configura la información del sitio web
            </p>
          </div>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de Plantilla */}
            <div>
              <Label htmlFor="template">Seleccionar Diseño de Footer</Label>
              <div className="mt-3">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                >
                  <CarouselContent className="px-12">
                    {Object.entries(template).map(([key, template]) => (
                      <CarouselItem key={key} className="md:basis-1/2 lg:basis-1/2">
                        <div
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${data.template === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => handleTemplateChange(key)}
                        >
                          <div className="bg-gray-100 rounded flex items-center justify-center h-96 overflow-hidden">
                            {template.preview ? (
                              <div className="transform scale-[0.75] origin-top max-h-full w-full">
                                {template.preview}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">Vista previa</div>
                            )}
                          </div>
                          <h3 className="font-medium text-center">{template.name}</h3>
                          {template.description && (
                            <p className="text-xs text-gray-500 text-center mt-1">{template.description}</p>
                          )}
                          {data.template === key && (
                            <div className="absolute top-2 right-2">
                              <CheckIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="left-1" />
                  <CarouselNext className="right-1" />
                </Carousel>
              </div>
            </div>

            {/* Configuración general */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Label htmlFor="name">Nombre del Footer</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Contenido específico de la plantilla */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Contenido del Footer</Label>
                {renderTemplateContent()}
              </div>

            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={processing || isUploading}>
                {(processing || isUploading) ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}