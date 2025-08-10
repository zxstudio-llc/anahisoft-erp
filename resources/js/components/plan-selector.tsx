import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Label } from "@/components/ui/label";
  import InputError from "./input-error";
  
  interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    is_free?: boolean;
  }
  
  interface PlanSelectorProps {
    data: {
      plan_id: string;
      billing_period: "monthly" | "yearly";
    };
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    plans: Plan[];
    formatPrice: (price: number, period: string) => string;
  }
  
  export const PlanSelector = ({
    data,
    setData,
    errors,
    plans,
    formatPrice,
  }: PlanSelectorProps) => {
    // Encontrar el plan seleccionado
    const selectedPlan = plans.find(plan => plan.id === data.plan_id);
  
    return (
      <div className="grid gap-4">
        <Label htmlFor="plan_id">
          Seleccione un plan <span className="text-red-500">*</span>
        </Label>
  
        <Select
          value={data.plan_id || ""}
          onValueChange={(value) => setData('plan_id', value)}
        >
          <SelectTrigger id="plan_id" className="w-full">
            <SelectValue placeholder="Seleccione un plan">
              {selectedPlan && (
                <div className="flex flex-col text-start">
                  <span className="font-medium text-sm">{selectedPlan.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedPlan.is_free
                      ? "Gratis"
                      : formatPrice(selectedPlan.price, data.billing_period)}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
  
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                <div className="flex flex-col text-start">
                  <span className="font-medium text-sm">{plan.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.is_free
                      ? "Gratis"
                      : formatPrice(plan.price, data.billing_period)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <InputError message={errors.plan_id} />
      </div>
    );
  };