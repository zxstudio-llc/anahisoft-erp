import { SubscriptionPlan, SubscriptionStatus } from "../subscription-plan.interface";
import { User } from "./users.interface";

export interface Props {
    currentPlan: SubscriptionPlan | null;
    availablePlans: SubscriptionPlan[];
    subscriptionStatus: SubscriptionStatus;
    userAccount: User;
}
