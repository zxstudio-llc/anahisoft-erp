import { Link } from '@inertiajs/react';

interface FooterAdvancedProps {
    content: {
        columns?: Array<{
            title: string;
            links: Array<{ text: string; url: string }>;
        }>;
        newsletter?: {
            title: string;
            description: string;
            placeholder: string;
            button_text: string;
        };
        copyright?: string;
    };
    previewMode?: boolean;
}

export default function FooterAdvanced({ content, previewMode = false }: FooterAdvancedProps) {
    return (
        <footer className={`bg-gray-900 text-white ${previewMode ? 'scale-90 transform' : ''}`}>
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Columnas dinámicas */}
                    {content.columns?.map((column, colIndex) => (
                        <div key={colIndex}>
                            <h3 className="text-lg font-semibold mb-6">{column.title}</h3>
                            <ul className="space-y-3">
                                {column.links?.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link 
                                            href={link.url}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    
                    {/* Newsletter */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6">{content.newsletter?.title}</h3>
                        <p className="text-gray-400 mb-6">{content.newsletter?.description}</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder={content.newsletter?.placeholder}
                                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary flex-grow"
                            />
                            <button className="bg-primary text-white px-6 py-2 rounded-r-md hover:bg-primary-dark transition-colors">
                                {content.newsletter?.button_text}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
                    <p>{content.copyright}</p>
                </div>
            </div>
        </footer>
    );
}