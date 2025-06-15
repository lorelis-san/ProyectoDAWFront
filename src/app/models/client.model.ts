export interface Client {
  id?: number;
  firstName?: string;
  lastName?: string;
  typeDocument: string;
  documentNumber: string;
  businessName?: string;
  phoneNumber: string;
  email: string;
  enabled?: boolean;
}
