import { IDocumentModel } from "../document/document-model";
export interface ICustomer {
  email: string;
  name: string;
}

export interface INotify {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface IReminders {
  status: string;
}

export interface IPaymentNotes {
  threadsQuantity: string;
  totalAmount: string;
  unitPrice: string;
  userId: string;
  referredBy?: string;
  subscription?: string;
  gstRate?: string;
  gstAmount?: string;
}

export interface IRazorpayPaymentLink {
  accept_partial: boolean;
  amount: number;
  amount_paid: number;
  callback_method: string;
  callback_url: string;
  cancelled_at: number;
  created_at: number;
  currency: string;
  customer: ICustomer;
  description: string;
  expire_by: number;
  expired_at: number;
  first_min_partial_amount: number;
  id: string;
  notes: IPaymentNotes;
  notify: INotify;
  order_id: string;
  reference_id: string;
  reminder_enable: boolean;
  reminders: IReminders;
  short_url: string;
  status: string;
  updated_at: number;
  upi_link: boolean;
  user_id: string;
  whatsapp_link: boolean;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export enum CommandType {
  ELABORATE = "ELABORATE",
  STRUCTURED_REPORTING = "STRUCTURED_REPORTING",
  REGULAR = "REGULAR",
}

export interface Template {
  isTemplate: boolean;
  description: string;
  prompt: string;
}

export interface Compare {
  isCompare: boolean;
  compareData: {
    date: string;
    description: string;
  };
}

export interface MessageRequest {
  threadId: string;
  messages: Message[];
  commandType?: CommandType;
  template?: Template | null;
  customInstructions?: string | null;
  document?: IDocumentModel | null;
  isApplyChange?: boolean;
}
