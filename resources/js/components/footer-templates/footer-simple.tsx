import { Link } from '@inertiajs/react';

interface FooterSimpleProps {
    content: {
        logo?: string;
        about?: string;
        links?: Array<{ text: string; url: string }>;
        social_links?: Array<{ icon: string; url: string }>;
        copyright?: string;
    };
    previewMode?: boolean;
}

export default function FooterSimple({ content, previewMode = false }: FooterSimpleProps) {
    return (
        <footer className={`bg-gray-800 text-white ${previewMode ? 'scale-90 transform' : ''}`}>
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        {content.logo && (
                            <div className="mb-4">
                                <img src={content.logo} alt="Logo" className="h-10" />
                            </div>
                        )}
                        <p className="text-gray-300">{content.about}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold mb-4">Enlaces</h3>
                        <ul className="space-y-2">
                            {content.links?.map((link, index) => (
                                <li key={index}>
                                    <Link 
                                        href={link.url} 
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold mb-4">Síguenos</h3>
                        <div className="flex space-x-4">
                            {content.social_links?.map((social, index) => (
                                <a 
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    <span className="sr-only">{social.icon}</span>
                                    <i className={`fab fa-${social.icon} text-xl`} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>{content.copyright}</p>
                </div>
            </div>
        </footer>
    );
}