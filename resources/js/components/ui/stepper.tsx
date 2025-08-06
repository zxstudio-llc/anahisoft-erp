import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
    title: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("mb-6", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                    currentStep === index + 1
                                        ? "bg-indigo-600 text-white"
                                        : currentStep > index + 1
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-600 dark:bg-gray-800"
                                )}
                            >
                                {currentStep > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <div className="text-xs mt-2 text-center">
                                {step.title}
                            </div>
                            {step.description && (
                                <div className="text-xs text-muted-foreground text-center">
                                    {step.description}
                                </div>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-1 w-12 mx-2",
                                    currentStep > index + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

interface StepperContentProps {
    step: number;
    currentStep: number;
    children: React.ReactNode;
}

export function StepperContent({ step, currentStep, children }: StepperContentProps) {
    if (step !== currentStep) return null;
    return <div className="space-y-4">{children}</div>;
}

interface StepperNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    nextLabel?: string;
    previousLabel?: string;
    className?: string;
}

export function StepperNavigation({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    isSubmitting = false,
    submitLabel = "Guardar",
    nextLabel = "Siguiente",
    previousLabel = "Anterior",
    className
}: StepperNavigationProps) {
    return (
        <div className={cn("flex justify-between gap-4 w-full", className)}>
            {currentStep > 1 && (
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    {previousLabel}
                </button>
            )}
            
            <button
                type={currentStep === totalSteps ? "submit" : "button"}
                onClick={currentStep === totalSteps ? undefined : onNext}
                disabled={isSubmitting}
                className="ml-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    "Procesando..."
                ) : currentStep === totalSteps ? (
                    submitLabel
                ) : (
                    nextLabel
                )}
            </button>
        </div>
    );
} 