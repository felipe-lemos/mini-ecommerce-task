"use client";
import Link from "next/link";
import { getProductById } from "@/lib/commerceLayer";
import Image from "next/image";
import { useCartContext } from "@/context/CartContext";
import { useState, useEffect, use } from "react";
import React from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  prices: Array<{ formatted_amount: string }>;
  code: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);

  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCartContext();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const prod = await getProductById(productId);
      setProduct(prod);
    })();
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart({
      sku_code: product.code,
      quantity: qty,
      image_url: product.image_url,
      name: product.name,
    });
    setAdding(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link
        href="/"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        &larr; Back to Products
      </Link>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      {product.image_url && (
        <Image
          src={product.image_url}
          alt={product.name}
          width={400}
          height={400}
          className="object-contain mb-4"
        />
      )}
      <div className="text-lg mb-2">
        {product.prices?.[0]?.formatted_amount}
      </div>
      <div className="text-gray-600 mb-4">{product.description}</div>
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="qty" className="font-medium">
          Qty:
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 px-2 py-1 border rounded text-center"
        />
      </div>
      <button
        type="button"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        onClick={handleAddToCart}
        disabled={adding}
      >
        {adding ? "Adding..." : success ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
