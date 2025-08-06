export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot?: {
        role_id: number;
        permission_id: number;
    };
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    description: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface RolesPagination {
    current_page: number;
    data: Role[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface RolesResponse {
    success: boolean;
    roles: RolesPagination;
    filters: {
        search: string;
        sort_field: string;
        sort_order: string;
        per_page: number;
    };
}

export interface PermissionsResponse {
    success: boolean;
    permissions: Permission[];
}

export interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    permissions: Array<{ value: string; label: string }>;
    role?: Role;
    onSuccess?: () => void;
}

export interface RoleFormData {
    name: string;
    permissions: string[];
}

export const defaultFilters = {
    search: '',
    sort_field: 'name',
    sort_order: 'asc',
    per_page: 10,
} as const;

export const defaultPagination: PaginationMeta = {
    current_page: 1,
    from: 0,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 0,
    total: 0,
};
