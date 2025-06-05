"use client";
import Image from "next/image";
import { useState } from "react";
import { useCartContext } from "../context/CartContext";

interface Price {
  formatted_compare_at_amount?: string;
  formatted_amount: string;
  amount_cents: number;
  currency_code: string;
  compare_at_amount_cents?: number;
  compare_at_currency_code?: string;
  formatted_compare_at_amount_with_taxes?: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  prices: Price[];
  code: string;
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [successSku, setSuccessSku] = useState<string | null>(null);
  const { addToCart, loading, error } = useCartContext();

  const handleAddToCart = async (
    sku_code: string,
    image_url: string,
    name: string
  ) => {
    setSelectedProduct(sku_code);
    await addToCart({
      sku_code,
      quantity: 1,
      image_url,
      name,
    });
    setSelectedProduct(null);
    setSuccessSku(sku_code);
    setTimeout(() => setSuccessSku(null), 1500);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex flex-col items-center content-center"
          >
            <span>{product.name}</span>
            <Image
              src={product.image_url}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain mb-4 cursor-pointer"
              onClick={() => (window.location.href = `/products/${product.id}`)}
            />
            <div>
              <span>{product.prices[0].formatted_amount}</span>
            </div>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading && selectedProduct === product.code}
              onClick={() =>
                handleAddToCart(product.code, product.image_url, product.name)
              }
            >
              {loading && selectedProduct === product.code
                ? "Adding..."
                : "Add to Cart"}
            </button>

            {successSku === product.code && !error && (
              <div className="text-green-600 mt-2">Added!</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
