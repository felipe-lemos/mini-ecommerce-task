"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartIcon } from "../components/CartIcon";
import { CartProvider } from "../context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <CartIcon />
          </div>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
