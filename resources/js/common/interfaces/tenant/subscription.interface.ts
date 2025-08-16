import { SubscriptionPlan, SubscriptionStatus } from "../subscription-plan.interface";

export interface Props {
    currentPlan: SubscriptionPlan | null;
    availablePlans: SubscriptionPlan[];
    subscriptionStatus: SubscriptionStatus;
}
