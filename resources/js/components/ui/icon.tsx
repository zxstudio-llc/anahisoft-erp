import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface IconProps {
    iconNode?: LucideIcon | null;
    name?: string;
    className?: string;
}

const iconMap: Record<string, LucideIcon> = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
};

export function Icon({ iconNode: IconComponent, name, className }: IconProps) {
    if (name && iconMap[name]) {
        const NamedIcon = iconMap[name];
        return <NamedIcon className={className} />;
    }

    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}
