import { useState, useEffect } from 'react';
import { Footer, Menu } from '@/types';

interface FooterEditorProps {
  footer: Footer;
  templates: Record<string, any>;
  menus: Menu[];
  menuItems: any[];
  onSave: (footer: Footer) => void;
}

export default function FooterEditor({
  footer: initialFooter,
  templates,
  menus,
  menuItems,
  onSave
}: FooterEditorProps) {
  const [footer, setFooter] = useState<Footer>(initialFooter);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFooter(initialFooter);
    setIsDirty(false);
  }, [initialFooter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFooter(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  const handleContentChange = (key: string, value: any) => {
    setFooter(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value;
    setFooter(prev => ({
      ...prev,
      template,
      content: templates[template].default_content
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(footer);
    setIsDirty(false);
  };

  return (
    <div className="footer-editor space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel de configuración */}
          <div className="col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Footer</label>
              <input
                type="text"
                name="name"
                value={footer.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Plantilla</label>
              <select
                value={footer.template}
                onChange={handleTemplateChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.entries(templates).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Menú asociado</label>
              <select
                name="menu_id"
                value={footer.menu_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sin menú</option>
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Configuración específica de la plantilla */}
            {footer.template && templates[footer.template] && (
              <div className="space-y-4">
                {Object.entries(templates[footer.template].default_content).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</label>
                    {typeof value === 'string' ? (
                      <input
                        type="text"
                        value={footer.content[key] || ''}
                        onChange={(e) => handleContentChange(key, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : Array.isArray(value) ? (
                      <div className="space-y-2">
                        {footer.content[key]?.map((item: any, index: number) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={item.text || ''}
                              onChange={(e) => {
                                const newItems = [...footer.content[key]];
                                newItems[index].text = e.target.value;
                                handleContentChange(key, newItems);
                              }}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Texto"
                            />
                            <input
                              type="text"
                              value={item.url || ''}
                              onChange={(e) => {
                                const newItems = [...footer.content[key]];
                                newItems[index].url = e.target.value;
                                handleContentChange(key, newItems);
                              }}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="URL"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...footer.content[key], { text: '', url: '' }];
                            handleContentChange(key, newItems);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Añadir elemento
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Vista previa */}
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Vista previa del footer</h2>
              
              {/* Renderizar el footer según la plantilla seleccionada */}
              {footer.template === 'template1' && (
                <div className="template1-preview">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                      {footer.logo_path && (
                        <img src={footer.logo_path} alt="Logo" className="h-12" />
                      )}
                      <p className="mt-2 text-gray-600">{footer.content.about}</p>
                    </div>
                    
                    {footer.menu_id && footer.content.use_menu && menuItems.length > 0 && (
                      <nav className="flex flex-wrap justify-center gap-6">
                        {menuItems.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            className="text-gray-700 hover:text-blue-600"
                          >
                            {item.label}
                          </a>
                        ))}
                      </nav>
                    )}
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
                    {footer.content.copyright}
                  </div>
                </div>
              )}
              
              {footer.template === 'template2' && (
                <div className="template2-preview">
                  {/* Implementar la vista previa de template2 */}
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
                  <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
                    {footer.content.copyright}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty}
            className={`px-4 py-2 rounded-md text-white ${isDirty ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}