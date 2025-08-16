import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface PageProps {
    auth: {
        user: User;
    };
}

export function useAuth() {
    const { auth } = usePage<PageProps>().props;

    return {
        user: auth.user,
    };
} 