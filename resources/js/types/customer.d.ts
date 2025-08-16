import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface BingoCard {
    id: string;
    game_id: string;
    table_number: string;
    customer_id: string;
    validation_code: string;
    invoice?: {
        invoice_number: string;
        invoice_date: string;
    };
    customer: {
        first_name: string;
        last_name: string;
        dni: string;
    };
    game: {
        game_number: string;
        end_time: string;
        status: string;
        [key: string]: any;
    };
    card_1: number[][] | string;
    card_2: number[][] | string;
    card_3: number[][] | string;
    card_4: number[][] | string;
    card_5: number[][] | string;
    card_6: number[][] | string;
    created_at: string;
    updated_at: string;
}

export interface Game {
    id: string;
    game_number: string;
    name: string;
    status: 'activo' | 'finalizado';
    start_time: string;
    end_time: string;
    created_at: string;
    updated_at: string;
}

export interface PageProps extends InertiaPageProps {
    cards: BingoCard[];
    activeGames: Game[];
    games?: Game[]; // Para el filtro
    users?: User[]; // Para el filtro
    filters?: {
        game_id?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
    };
    flash?: {
        success?: string;
    };
}


export interface User {
    id: string;
    first_name: string;
    last_name: string;
    dni: string;
}