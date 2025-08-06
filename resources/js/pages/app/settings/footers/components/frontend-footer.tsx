import { Footer } from '@/types';

interface FrontendFooterProps {
  footer: Footer;
}

export default function FrontendFooter({ footer }: FrontendFooterProps) {
  if (!footer) return null;

  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        {footer.template === 'template1' && (
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              {footer.logo_path && (
                <img src={footer.logo_path} alt="Logo" className="h-12" />
              )}
              <p className="mt-2 text-gray-600">{footer.content.about}</p>
            </div>
            
            {footer.menu_id && footer.content.use_menu && footer.menu?.items && (
              <nav className="flex flex-wrap justify-center gap-6">
                {footer.menu.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    className="text-gray-700 hover:text-blue-600"
                    target={item.target}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        )}
        
        {footer.template === 'template2' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {footer.content.columns?.map((column: any, index: number) => (
              <div key={index}>
                <h3 className="text-lg font-medium mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links?.map((link: any, linkIndex: number) => (
                    <li key={linkIndex}>
                      <a href={link.url} className="text-gray-600 hover:text-blue-600">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
          {footer.content.copyright}
        </div>
      </div>
    </footer>
  );
}