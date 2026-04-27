export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  referralCode: string;
  availableCredits: number;
  totalCredits: number;
  currentSubscription?: {
    planType: string;
    startDate: string;
    endDate: string;
  };
  unlimitedUsage?: number;
}
