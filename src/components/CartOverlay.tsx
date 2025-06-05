import React from "react";
import Image from "next/image";
import { useCartContext } from "../context/CartContext";

export const CartOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { items, loading, error, removeFromCart, cartSummary } =
    useCartContext();

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 400,
        height: "100vh",
        background: "#000",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
        zIndex: 2000,
        padding: 24,
        overflowY: "auto",
        transition: "transform 0.3s",
      }}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 24,
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Close cart"
      >
        ×
      </button>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        Your Cart
      </h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {items.length === 0 && !loading && <div>Your cart is empty.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.sku_code}
            style={{
              marginBottom: 16,
              borderBottom: "1px solid #eee",
              paddingBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Image
                src={item.image_url}
                alt={item.name}
                width={48}
                height={48}
                style={{
                  objectFit: "cover",
                  borderRadius: 4,
                  background: "#fff",
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: "#fff" }}>
                  {item.name}
                </div>
                <div style={{ color: "#555", fontSize: 14 }}>
                  Qty: {item.quantity}
                </div>
                <div style={{ color: "#555", fontSize: 14 }}>
                  Total Price: {item.formatted_total_amount}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.sku_code)}
                style={{
                  background: "#e53e3e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {cartSummary && (
        <div
          style={{
            marginTop: 32,

            paddingTop: 24,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
              color: "#fff",
            }}
          >
            Summary
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>Subtotal:</span>
            <span>{cartSummary.formatted_subtotal_amount}</span>
          </div>
          {cartSummary.formatted_discount_amount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Discount:</span>
              <span>{cartSummary.formatted_discount_amount}</span>
            </div>
          )}
          {cartSummary.formatted_shipping_amount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Shipping:</span>
              <span>{cartSummary.formatted_shipping_amount}</span>
            </div>
          )}
          {cartSummary.formatted_total_tax_amount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Tax:</span>
              <span>{cartSummary.formatted_total_tax_amount}</span>
            </div>
          )}
          {cartSummary.formatted_gift_card_amount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Gift Card:</span>
              <span>{cartSummary.formatted_gift_card_amount}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: 18,
              marginTop: 16,
            }}
          >
            <span>Total:</span>
            <span>{cartSummary.formatted_total_amount_with_taxes}</span>
          </div>
        </div>
      )}
    </div>
  );
};
