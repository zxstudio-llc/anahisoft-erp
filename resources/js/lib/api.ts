import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Tipos de respuesta para autenticación
interface AuthResponse {
    token?: string;
    user?: unknown;
    message?: string;
    auth_type?: 'token' | 'session';
}

interface ApiErrorResponse {
    message: string;
    [key: string]: unknown;
}

let csrfLoaded = false;
let csrfPromise: Promise<void> | null = null;
let apiToken: string | null = localStorage.getItem('api_token');
const prefix = import.meta.env.VITE_API_PREFIX;

// Create a separate instance for CSRF requests to avoid infinite recursion
const csrfClient = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

const api: AxiosInstance = axios.create({
    baseURL: '/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// Función que garantiza que la cookie CSRF esté cargada (solo para autenticación por sesión)
async function ensureCsrfCookie(): Promise<void> {
    // Si tenemos token API, no necesitamos CSRF
    if (apiToken) {
        return;
    }

    if (csrfLoaded) {
        return;
    }

    // If a CSRF request is already in progress, wait for it
    if (csrfPromise) {
        return csrfPromise;
    }

    // Create the promise and store it to prevent multiple simultaneous requests
    csrfPromise = (async () => {
        try {
            await csrfClient.get(`/sanctum/csrf-cookie`);
            csrfLoaded = true;
            console.log('✅ CSRF cookie loaded successfully');
        } catch (error) {
            console.error('❌ Error al cargar CSRF cookie:', error);
            csrfLoaded = false;
            throw error;
        } finally {
            csrfPromise = null; // Reset the promise
        }
    })();

    return csrfPromise;
}

// Reset CSRF state (useful for testing or manual resets)
function resetCsrfState(): void {
    csrfLoaded = false;
    csrfPromise = null;
}

// Función para establecer el token API
function setApiToken(token: string | null): void {
    apiToken = token;
    if (token) {
        localStorage.setItem('api_token', token);
        // Reset CSRF state when switching to token auth
        resetCsrfState();
    } else {
        localStorage.removeItem('api_token');
    }
}

// Función para obtener el token API actual
function getApiToken(): string | null {
    return apiToken;
}

// Función para determinar si estamos usando autenticación por token
function isTokenAuth(): boolean {
    return apiToken !== null;
}

// Interceptor de request con soporte para sesiones y tokens
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Asegurarse de que la URL base incluya el subdominio del tenant si estamos en un tenant
        const host = window.location.host;
        if (host && !host.includes('localhost')) {
            config.baseURL = `${window.location.protocol}//${host}`;
        }

        // Skip CSRF for the CSRF endpoint itself to prevent recursion
        if (config.url?.includes(`/sanctum/csrf-cookie`)) {
            return config;
        }

        // Si tenemos token API, usar autenticación por token
        if (apiToken) {
            config.headers['Authorization'] = `Bearer ${apiToken}`;
            // Para tokens API, mantener credenciales para compatibilidad con CORS
            config.withCredentials = true;
            return config;
        }

        // Si no tenemos token, usar autenticación por sesión (CSRF + cookies)
        try {
            await ensureCsrfCookie();
        } catch (error) {
            console.error('Failed to ensure CSRF cookie:', error);
            // Don't reject the request, let it proceed (Laravel might handle it)
        }

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }

        // Asegurarse de que las credenciales se envíen para autenticación por sesión
        config.withCredentials = true;

        return config;
    },
    (error) => Promise.reject(error),
);

// Interceptor de respuesta: manejo de errores centralizado
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Devolver la respuesta completa
        return response;
    },
    async (error: AxiosError) => {
        // Manejo de errores CSRF (solo para autenticación por sesión)
        if (error.response?.status === 419 && !isTokenAuth()) {
            console.warn('⚠️ Token CSRF expirado. Recargando...');
            resetCsrfState();

            // Try to reload CSRF token instead of reloading the page immediately
            try {
                await ensureCsrfCookie();
                // Optionally retry the original request
                if (error.config) {
                    return api.request(error.config);
                }
            } catch (csrfError) {
                console.error('Failed to reload CSRF token:', csrfError);
                window.location.reload();
            }
            return;
        }

        // Manejo de errores de autenticación (401)
        if (error.response?.status === 401) {
            console.warn('⚠️ Usuario no autenticado.');

            // Si estamos usando token y falla, limpiar token
            if (isTokenAuth()) {
                setApiToken(null);
                console.warn('⚠️ Token API inválido, limpiando...');
            }

            // NO hacer redirección automática, solo rechazar la promesa
            // La aplicación debe manejar este error según el contexto
            const errorMessage = (error.response?.data as ApiErrorResponse)?.message || 'No estás autenticado. Por favor inicia sesión.';
            return Promise.reject(new Error(errorMessage));
        }

        // Handle server errors more gracefully
        if (error.response?.status === 500) {
            console.error('❌ Server error:', error.response.data);
            return Promise.reject(new Error('Error interno del servidor. Por favor, inténtalo de nuevo.'));
        }

        if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            return Promise.reject(new Error((error.response.data as { message: string }).message));
        }

        return Promise.reject(error);
    },
);

// API wrapper para tipos genéricos
const Api = {
    get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
        return await api.get(url, { params });
    },

    post: async <T>(url: string, data?: unknown): Promise<T> => {
        return await api.post(url, data);
    },

    put: async <T>(url: string, data?: unknown): Promise<T> => {
        return await api.put(url, data);
    },

    patch: async <T>(url: string, data?: unknown): Promise<T> => {
        return await api.patch(url, data);
    },

    delete: async <T>(url: string): Promise<T> => {
        return await api.delete(url);
    },

    // Auth utilities
    setToken: setApiToken,
    getToken: getApiToken,
    isTokenAuth: isTokenAuth,
    resetCsrf: resetCsrfState,

    // Login method que puede retornar un token o usar sesión
    login: async (credentials: { email: string; password: string; remember?: boolean }) => {
        try {
            const response = await api.post<AuthResponse>(`${prefix}/auth/login`, credentials) as AuthResponse;

            // Si el login retorna un token, guardarlo
            if (response.token) {
                setApiToken(response.token);
                console.log('✅ Login exitoso con token API');
            } else {
                console.log('✅ Login exitoso con sesión');
            }

            return response;
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    },

    // Logout que maneja ambos tipos de autenticación
    logout: async () => {
        try {
            await api.post(`${prefix}/auth/logout`);

            // Limpiar token si existe
            if (isTokenAuth()) {
                setApiToken(null);
            }

            // Reset CSRF state
            resetCsrfState();

            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error en logout:', error);
            // Limpiar estado local incluso si el logout falló
            setApiToken(null);
            resetCsrfState();
            throw error;
        }
    },

    // Refresh token (solo para autenticación por token)
    refreshToken: async () => {
        if (!isTokenAuth()) {
            throw new Error('No hay token para refrescar');
        }

        try {
            const response = await api.post<AuthResponse>(`${prefix}/auth/refresh`) as AuthResponse;
            if (response.token) {
                setApiToken(response.token);
                console.log('✅ Token refrescado exitosamente');
            }
            return response;
        } catch (error) {
            console.error('❌ Error al refrescar token:', error);
            setApiToken(null);
            throw error;
        }
    },

    // Obtener usuario actual
    getCurrentUser: async () => {
        return await api.get(`${prefix}/user`);
    },

    // Ejemplo de método adicional (opcional)
    validateRuc: async (ruc: string) => {
        try {
            return await api.get(`${prefix}/sris/${ruc}`);
        } catch (error) {
            console.error('❌ Error al validar RUC:', error);
            throw error;
        }
    },
};

// Inicializar token desde localStorage al cargar
if (apiToken) {
    console.log('🔑 Token API cargado desde localStorage');
}

// Función de diagnóstico para debug
function debugAuthState(): void {
    console.group('🔍 Debug Estado de Autenticación');
    console.log('📊 Token API:', apiToken ? 'Presente' : 'No presente');
    console.log('🍪 CSRF cargado:', csrfLoaded);
    console.log('🌐 Dominio actual:', window.location.host);
    console.log('🔗 URL actual:', window.location.href);
    console.log('📡 Tipo de auth:', isTokenAuth() ? 'Token' : 'Sesión');
    
    // Verificar cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
    
    console.log('🍪 Cookies relevantes:', {
        session: cookies['fact_session'] ? 'Presente' : 'No presente',
        csrf: cookies['XSRF-TOKEN'] ? 'Presente' : 'No presente'
    });
    console.groupEnd();
}

// Export diagnósticos
export { debugAuthState };

export default Api;
