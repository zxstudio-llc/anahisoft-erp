import { Head, Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TenantNotFound({ 
    message = 'Inquilino no encontrado',
    domain,
    centralDomain
}: { 
    message?: string;
    domain?: string;
    centralDomain?: string;
}) {
    return (
        <>
            <Head title="Inquilino no encontrado" />
            <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-[10px] opacity-50">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl" />
                    </div>
                </div>

                <div className="relative max-w-xl p-8 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl text-center">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                <Building2 className="w-24 h-24 text-indigo-600 drop-shadow-xl" />
                            </motion.div>
                            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl -z-10" />
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 space-y-4"
                    >
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            Inquilino no encontrado
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">{message}</p>
                        
                        {domain && (
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                            >
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Dominio actual:
                                </p>
                                <code className="block mt-2 text-sm font-mono bg-gray-100/80 dark:bg-gray-700/80 p-3 rounded-lg">
                                    {domain}
                                </code>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {centralDomain ? (
                            <a
                                href={`https://${centralDomain}`}
                                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
                            >
                                Ir al sitio principal
                            </a>
                        ) : (
                            <Link
                                href="/"
                                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl"
                            >
                                Volver al inicio
                            </Link>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
} 