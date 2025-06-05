"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { authenticate } from "@commercelayer/js-auth";

const AUTH_COOKIE_NAME = "commerce_layer_auth";
const config = {
  clientId: process.env.NEXT_PUBLIC_COMMERCE_LAYER_CLIENT_ID ?? "",
  scope: process.env.NEXT_PUBLIC_COMMERCE_LAYER_SCOPE ?? "",
  organization: process.env.NEXT_PUBLIC_COMMERCE_LAYER_ORGANIZATION ?? "",
};

if (!config.clientId || !config.scope || !config.organization) {
  throw new Error("Missing Commerce Layer environment variables.");
}

export function CommerceLayerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function ensureAuthCookie() {
      const authCookie = Cookies.get(AUTH_COOKIE_NAME);
      let needsAuth = true;
      if (authCookie) {
        try {
          const authData = JSON.parse(authCookie);
          const expiry = new Date(authData.expires).getTime();
          if (Date.now() < expiry - 300000) {
            needsAuth = false;
          }
        } catch {}
      }
      if (needsAuth) {
        try {
          const authData = await authenticate("client_credentials", {
            clientId: config.clientId,
            scope: config.scope,
          });
          const expiryInDays =
            (new Date(authData.expires).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24);
          Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(authData), {
            expires: expiryInDays,
            secure: true,
            sameSite: "strict",
          });
        } catch (e) {
          console.error("Commerce Layer authentication failed", e);
        }
      }
      setLoading(false);
    }
    ensureAuthCookie();
  }, []);

  if (loading) return <div>Loading authentication...</div>;
  return <>{children}</>;
}
