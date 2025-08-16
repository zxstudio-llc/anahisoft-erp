import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/theme-toggle';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/">
                            <img
                                className="h-8 w-auto"
                                src="/logo.png"
                                alt="Logo"
                            />
                        </Link>
                    </div>
                    <div className="hidden sm:flex sm:items-center sm:justify-center flex-1">
                        <div className="flex space-x-8">
                            <Link
                                href="#features"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                                Características
                            </Link>
                            <Link
                                href="#benefits"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                                Beneficios
                            </Link>
                            <Link
                                href="#pricing"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                                Precios
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <ThemeToggle />
                        <Link
                            href="/register"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full transition-all duration-200"
                        >
                            Empezar ahora
                        </Link>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <span className="sr-only">Abrir menú</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        href="#features"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(false)}
                    >
                        Características
                    </Link>
                    <Link
                        href="#benefits"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(false)}
                    >
                        Beneficios
                    </Link>
                    <Link
                        href="#pricing"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(false)}
                    >
                        Precios
                    </Link>
                    <Link
                        href="/register"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                        onClick={() => setIsOpen(false)}
                    >
                        Empezar ahora
                    </Link>
                </div>
            </div>
        </nav>
    );
} 