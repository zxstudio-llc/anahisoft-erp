import { DefaultConfig } from "@/pages/app/pages/partial/default";
import { AboutConfig } from "@/pages/app/pages/templates/about";
import { LandingConfig } from "@/pages/app/pages/templates/landing";
import ContactConfig from "@/pages/app/pages/templates/contact";
import PortfolioConfig from "@/pages/app/pages/templates/portfolio";
import ServicesConfig from "@/pages/app/pages/templates/services";

export const TEMPLATE_REGISTRY = {
  default: {
    label: "Página Simple",
    description: "Plantilla básica para páginas de contenido",
    defaultValues: {},
    configComponent: DefaultConfig,
  },
  landing: {
    label: "Landing Page",
    description: "Plantilla para páginas de inicio con múltiples secciones",
    defaultValues: {
      heroTitle: "",
      heroSubtitle: "",
      heroButtonText: "",
      heroButtonLink: "",
      featuresTitle: "",
      featuresDescription: "",
      features: [],
      testimonials: [],
      highlights: [],
      ctaTitle: "",
      ctaDescription: "",
      ctaButtonText: "",
      ctaButtonLink: "",
      pricing: [],
      news: [],
    },
    configComponent: LandingConfig,
  },
  about: {
    label: "Sobre Nosotros",
    description: "Plantilla para páginas 'Sobre Nosotros' o 'Quiénes Somos'",
    defaultValues: {
      company_image: "",
      mission: "",
      vision: "",
      values: "",
    },
    configComponent: AboutConfig,
  },
  contact: {
    label: "Contacto",
    description: "Plantilla para páginas de contacto",
    defaultValues: {
      address: "",
      phone: "",
      email: "",
      map_embed: "",
    },
    configComponent: ContactConfig,
  },
  portfolio: {
    label: "Portafolio",
    description: "Plantilla para mostrar trabajos o proyectos",
    defaultValues: {
      projects: [],
    },
    configComponent: PortfolioConfig,
  },
  services: {
    label: "Servicios",
    description: "Plantilla para listar servicios ofrecidos",
    defaultValues: {
      services_list: [],
    },
    configComponent: ServicesConfig,
  },
};