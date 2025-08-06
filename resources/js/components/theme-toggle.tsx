import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => updateAppearance(appearance === 'light' ? 'dark' : 'light')}
            className="w-9 h-9"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
        </Button>
    );
} 