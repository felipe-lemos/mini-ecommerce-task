import React, { useState } from "react";
import { CartOverlay } from "./CartOverlay";
import { useCartContext } from "../context/CartContext";

export const CartIcon: React.FC = () => {
  const { items } = useCartContext();
  const [open, setOpen] = useState(false);
  const totalItems = (
    Array.isArray(items) ? items : ([] as { quantity: number }[])
  ).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return (
    <>
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          aria-label="Open cart"
          onClick={() => setOpen(true)}
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6h15l-1.5 9h-13z"
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="9" cy="21" r="1" fill="#fff" />
            <circle cx="18" cy="21" r="1" fill="#fff" />
          </svg>
          {totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
                minWidth: "20px",
                textAlign: "center",
              }}
              data-testid="cart-badge"
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>
      <CartOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
};
