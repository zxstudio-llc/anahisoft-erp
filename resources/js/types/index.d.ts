import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subItems?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// export interface User {
//     id: number;
//     first_name: string;
//     last_name: string;
//     address: string;
//     gender: string;
//     phone: string;
//     email: string;
//     avatar?: string;
//     roles?: Array<{ name: string }> | string[];
//     email_verified_at: string | null;
//     created_at: string;
//     updated_at: string;
//     [key: string]: unknown;
// }

export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}
  
export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
    users_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Seo {
    id: number;
    model_type: string;
    model_id: string;
    description: string;
    route: string;
    title: string;
    image: string;
    author: string;
    robots: string;
    keywords: string;
    canonical_url: string;
}

export interface PageProps {
    id: number;
    title: string;
    slug: string;
    content: string;
    is_active: boolean;
}

export interface Media {
    id: string
    name: string
    url: string
    mime_type: string
    size: number
    created_at: string
    updated_at: string
}

export interface Gallery {
    id: string
    layout_type: string
    items: GalleryItem[]
    created_at: string
    updated_at: string
}

export interface GalleryItem {
    id: string
    position: number
    alt_text?: string
    media: Media
}

export interface Game {
    id: number
    name: string
    start_time: string
    end_time: string
    status: 'pending' | 'active' | 'finished'
    game_number: string
    created_at: string
    updated_at: string
  }
  

  export interface Menu {
    id: number;
    title: string;
    description?: string;
    location?: string;
    is_active: boolean;
    items?: MenuItem[];
  }
  
  export interface MenuItem {
    id: number;
    menu_id: number;
    label: string;
    url: string;
    type: string;
    object_id?: number;
    target: string;
    css_class?: string;
    order: number;
    parent_id?: number;
    is_active: boolean;
    children?: MenuItem[];
  }
  
  export interface Footer {
    id: number;
    name: string;
    template: string;
    menu_id?: number;
    content: Record<string, any>;
    is_active: boolean;
    logo_path?: string;
    created_at: string;
    updated_at: string;
    menu?: Menu;
  }