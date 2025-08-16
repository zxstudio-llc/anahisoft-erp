export interface TemplateComponentProps {
    data: Record<string, any>;
    onChange: (data: Record<string, any>) => void;
    errors?: Record<string, string>;
}

export interface TemplateConfig {
    name: string;
    label: string;
    description: string;
    configComponent: React.ComponentType<TemplateComponentProps>;
    defaultValues: Record<string, any>;
}