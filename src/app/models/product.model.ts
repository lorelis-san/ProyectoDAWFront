export interface Product {
id?: number;
  cod: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  year?: string;
  sede: string;
  costPrice?: number;
  dealerPrice?: number;
  salePrice?: number;
  stock?: number;
  imageUrl?: string;
  categoryProductId: number;
  supplierProductId: number;
  enabled?: boolean;
}
