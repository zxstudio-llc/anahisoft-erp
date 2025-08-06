import { Link } from '@inertiajs/react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const navigation = {
    solutions: [
        { name: 'Facturación Electrónica', href: '#' },
        { name: 'Validación de Documentos', href: '#' },
        { name: 'API REST', href: '#' },
        { name: 'Multi-empresa', href: '#' },
    ],
    support: [
        { name: 'Documentación', href: '#' },
        { name: 'Guías', href: '#' },
        { name: 'API', href: '#' },
        { name: 'Estado del Servicio', href: '#' },
    ],
    company: [
        { name: 'Acerca de', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Empleos', href: '#' },
        { name: 'Prensa', href: '#' },
    ],
    legal: [
        { name: 'Términos', href: '#' },
        { name: 'Privacidad', href: '#' },
        { name: 'Cookies', href: '#' },
    ],
    social: [
        {
            name: 'Facebook',
            href: '#',
            icon: Facebook,
        },
        {
            name: 'Twitter',
            href: '#',
            icon: Twitter,
        },
        {
            name: 'Instagram',
            href: '#',
            icon: Instagram,
        },
        {
            name: 'LinkedIn',
            href: '#',
            icon: Linkedin,
        },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <img
                            className="h-10"
                            src="/logo.svg"
                            alt="Logo"
                        />
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            Simplificando la facturación electrónica para empresas ecuatorianas.
                        </p>
                        <div className="flex space-x-6">
                            {navigation.social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-500 hover:text-gray-400"
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon className="h-6 w-6" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
                                    Soluciones
                                </h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    {navigation.solutions.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
                                    Soporte
                                </h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    {navigation.support.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
                                    Compañía
                                </h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    {navigation.company.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
                                    Legal
                                </h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    {navigation.legal.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href={item.href}
                                                className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {item.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <p className="text-base text-gray-500 dark:text-gray-400 xl:text-center">
                        &copy; {new Date().getFullYear()} Anahisoft. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
} 