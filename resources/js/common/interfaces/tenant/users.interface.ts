export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    created_at: string;
    last_login?: string;
    is_active: boolean;
    permissions?: string[];
    email_verified_at: string | null;
    tenant_id: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot?: {
        model_type: string;
        model_id: number;
        role_id: number;
    };
}

export interface UserStats {
    total: number;
    active: number;
    new_this_month: number;
    with_admin_role: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface Pagination {
    data: User[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

export interface Filters {
    search: string;
    role: string;
    is_active: boolean | null;
    sort_field: string;
    sort_order: string;
    per_page: number;
    page?: number;
}

export interface UsersPageProps {
    users: Pagination;
    roles: Role[];
    stats: UserStats;
    filters: Filters;
}

export interface ApiResponseData {
    success: boolean;
    users: {
        data: User[];
        current_page: number;
        from: number;
        last_page: number;
        links: PaginationLink[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    roles: Array<{ value: string; label: string }>;
    filters: Filters;
}

interface AxiosConfig {
    transitional: {
        silentJSONParsing: boolean;
        forcedJSONParsing: boolean;
        clarifyTimeoutError: boolean;
    };
    adapter: string[];
    transformRequest: (null)[];
    transformResponse: (null)[];
    timeout: number;
    xsrfCookieName: string;
    xsrfHeaderName: string;
    maxContentLength: number;
    maxBodyLength: number;
    env: Record<string, unknown>;
    headers: Record<string, string>;
    baseURL: string;
    withCredentials: boolean;
    params: {
        params: Filters;
    };
    method: string;
    url: string;
    allowAbsoluteUrls: boolean;
}

export interface ApiResponse {
    data: ApiResponseData;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosConfig;
    request: XMLHttpRequest;
}

export interface UpdateUserResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface DeleteResponse {
    data: {
        success: boolean;
        message: string;
    };
}
