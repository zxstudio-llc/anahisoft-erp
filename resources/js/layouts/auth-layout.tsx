import { type ReactNode } from 'react';
import { Toaster } from '@/components/ui/toast';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
    backgroundImage?: string;
}

export default function AuthLayout({ children, title, description, backgroundImage }: AuthLayoutProps) {
    return (
        <div className="min-h-screen">
            <div className="relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="relative flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                    <div
                        className="absolute inset-0 bg-cover"
                        style={{
                            backgroundImage: `url(${backgroundImage || '/images/auth-background.jpg'})`,
                        }}
                    />
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <img src="/logo.svg" alt="Logo" className="mr-2 h-6 w-6" />
                        Fact
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;This library has saved me countless hours of work and helped me deliver stunning
                                designs to my clients faster than ever before.&rdquo;
                            </p>
                            <footer className="text-sm">Sofia Davis</footer>
                        </blockquote>
                    </div>
                </div>
                <div className="p-8 lg:p-8 lg:py-12">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    );
}
