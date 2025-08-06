export interface Category {
    id: number;
    name: string;
    description: string | null;
    products_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedCategories {
    current_page: number;
    data: Category[];
    first_page_url: string;
    from: number | null;
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
    to: number | null;
    total: number;
}

export interface Filters {
    search: string;
    is_active: boolean | null;
    sort_field: string;
    sort_order: string;
    per_page: number;
    page?: number;
}

export interface CategoriesResponse {
    success: boolean;
    categories: PaginatedCategories;
    filters: Filters;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}
