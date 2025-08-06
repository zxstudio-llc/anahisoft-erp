export interface ApiKey {
    id: number;
    tokenable_type: string;
    tokenable_id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiKeyFormData {
    name: string;
    abilities: string[];
}

export interface ApiKeyResponse {
    success: boolean;
    tokens: {
        current_page: number;
        data: ApiKey[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
    filters: {
        search: string;
        sort_field: string;
        sort_order: string;
        per_page: number;
    };
}

export interface ApiKeyResponse {
    success: boolean;
    data: ApiKey[];
    current_page: number;
    from: number;
    last_page: number;
    to: number;
    total: number;
}

export interface ApiKeysProps {
    tokens: ApiKey[];
}
