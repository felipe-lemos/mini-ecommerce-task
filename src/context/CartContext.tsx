/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_COMMERCE_LAYER_ENDPOINT + "/api";
const CART_ID_SESSION_KEY = "mini_ecommerce_cart_id";

function getAccessTokenFromCookie() {
  const authCookie = Cookies.get("commerce_layer_auth");
  if (!authCookie) return null;
  try {
    const authData = JSON.parse(authCookie);
    return authData.accessToken;
  } catch {
    return null;
  }
}

function getCartIdFromSession() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CART_ID_SESSION_KEY);
}

function setCartIdInSession(cartId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CART_ID_SESSION_KEY, cartId);
}

// Add a type for the context value
interface CartItem {
  sku_code: string;
  quantity: number;
  image_url: string;
  name: string;
  formatted_total_amount: string;
  id: string;
}
interface CartSummary {
  number: number;
  skus_count: number;
  formatted_subtotal_amount: string;
  formatted_discount_amount: string;
  formatted_shipping_amount: string;
  formatted_total_tax_amount: string;
  formatted_gift_card_amount: string;
  formatted_total_amount_with_taxes: string;
}
interface CartContextType {
  cartId: string | null;
  items: CartItem[];
  addToCart: (params: {
    sku_code: string;
    quantity: number;
    image_url: string;
    name: string;
  }) => Promise<void>;
  getCart: () => Promise<CartItem[]>;
  removeFromCart: (sku_code: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  cartSummary: CartSummary | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartId, setCartId] = useState<string | null>(() =>
    getCartIdFromSession()
  );
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);

  const getCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    const sessionCartId = getCartIdFromSession();
    if (!sessionCartId) {
      setItems([]);
      setCartSummary(null);
      setLoading(false);
      return [];
    }
    const ACCESS_TOKEN = getAccessTokenFromCookie();
    if (!ACCESS_TOKEN) {
      setError("No access token found. Please authenticate.");
      setLoading(false);
      return [];
    }
    try {
      const response = await fetch(
        `${API_URL}/orders/${sessionCartId}?include=line_items&fields[orders]=number,skus_count,formatted_subtotal_amount,formatted_discount_amount,formatted_shipping_amount,formatted_total_tax_amount,formatted_gift_card_amount,formatted_total_amount_with_taxes,line_items&fields[line_items]=item_type,image_url,name,sku_code,formatted_unit_amount,quantity,formatted_total_amount`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const data = await response.json();
      // Extract summary from order attributes
      const summary: CartSummary = {
        number: data.data.attributes.number,
        skus_count: data.data.attributes.skus_count,
        formatted_subtotal_amount:
          data.data.attributes.formatted_subtotal_amount,
        formatted_discount_amount:
          data.data.attributes.formatted_discount_amount,
        formatted_shipping_amount:
          data.data.attributes.formatted_shipping_amount,
        formatted_total_tax_amount:
          data.data.attributes.formatted_total_tax_amount,
        formatted_gift_card_amount:
          data.data.attributes.formatted_gift_card_amount,
        formatted_total_amount_with_taxes:
          data.data.attributes.formatted_total_amount_with_taxes,
      };
      setCartSummary(summary);
      // Find all included line_items of type "skus"
      const fetchedItems = Array.isArray(data.included)
        ? data.included
            .filter(
              (item: any) =>
                item.type === "line_items" &&
                item.attributes?.item_type === "skus"
            )
            .map((item: any) => ({
              sku_code: item.attributes.sku_code,
              quantity: item.attributes.quantity,
              image_url: item.attributes.image_url,
              name: item.attributes.name,
              formatted_total_amount: item.attributes.formatted_total_amount,
              id: item.id,
            }))
        : [];
      setItems(fetchedItems);
      return fetchedItems;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setItems([]);
      setCartSummary(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async ({
      sku_code,
      quantity,
      image_url,
      name,
    }: {
      sku_code: string;
      quantity: number;
      image_url: string;
      name: string;
    }) => {
      setLoading(true);
      setError(null);
      const ACCESS_TOKEN = getAccessTokenFromCookie();
      if (!ACCESS_TOKEN) {
        setError("No access token found. Please authenticate.");
        setLoading(false);
        return;
      }
      try {
        let orderId = cartId;
        if (!orderId) {
          const orderRes = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            },
            body: JSON.stringify({ data: { type: "orders" } }),
          });
          const orderData = await orderRes.json();
          orderId = orderData.data.id;
          setCartId(orderId);
          if (orderId) setCartIdInSession(orderId);
        }
        const lineItemRes = await fetch(`${API_URL}/line_items`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          },
          body: JSON.stringify({
            data: {
              type: "line_items",
              attributes: {
                sku_code,
                quantity,
                image_url,
                name,

                _update_quantity: true,
              },
              relationships: {
                order: { data: { type: "orders", id: orderId } },
              },
            },
          }),
        });
        if (!lineItemRes.ok) throw new Error("Failed to add item to cart");
        // Refresh cart after adding
        await getCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [cartId, getCart]
  );

  // Add removeFromCart implementation
  const removeFromCart = useCallback(
    async (sku_code: string) => {
      setLoading(true);
      setError(null);
      const sessionCartId = getCartIdFromSession();
      const ACCESS_TOKEN = getAccessTokenFromCookie();
      if (!sessionCartId || !ACCESS_TOKEN) {
        setError("No cart or access token found. Please authenticate.");
        setLoading(false);
        return;
      }
      try {
        // Find the line item ID for the given sku_code
        const response = await fetch(
          `${API_URL}/orders/${sessionCartId}/line_items`,
          {
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch cart items");
        const data = await response.json();
        const lineItem = data.data.find(
          (item: any) => item.attributes.sku_code === sku_code
        );
        if (!lineItem) throw new Error("Item not found in cart");
        // Remove the line item
        const deleteRes = await fetch(`${API_URL}/line_items/${lineItem.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          },
        });
        if (!deleteRes.ok) throw new Error("Failed to remove item from cart");
        await getCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [getCart]
  );

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        addToCart,
        getCart,
        removeFromCart,
        loading,
        error,
        cartSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCartContext must be used within a CartProvider");
  return ctx;
};
