// src/types/commerceLayer.d.ts
interface Product {
  id: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
  };
  images?: Array<{
    url: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
  }>;
}
