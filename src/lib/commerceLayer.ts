/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticate } from "@commercelayer/js-auth";
import { CommerceLayer, CommerceLayerClient } from "@commercelayer/sdk";
import Cookies from "js-cookie";

// Configuration should come from environment variables
const config = {
  clientId:
    process.env.COMMERCE_LAYER_CLIENT_ID ||
    "0CRja4YI8vq9u-AtpToGhB-U5CgmSIzb_OSypl8F_g8",
  scope: process.env.COMMERCE_LAYER_SCOPE || "market:id:ElDkXhpEGg",
  organization:
    process.env.COMMERCE_LAYER_ORGANIZATION || "felipe-s-organization",
};

// Cookie name for auth data
const AUTH_COOKIE_NAME = "commerce_layer_auth";

// Get a valid client with authentication
async function getClient(): Promise<CommerceLayerClient> {
  const currentTime = Date.now();
  let authData: any = null;
  let authExpiryTime = 0;

  // Try to get auth data from cookie
  const authCookie = Cookies.get(AUTH_COOKIE_NAME);
  if (authCookie) {
    try {
      authData = JSON.parse(authCookie);
      authExpiryTime = new Date(authData.expires).getTime();
    } catch (e) {
      console.error("Error parsing auth cookie:", e);
    }
  }

  // Check if token is expired or will expire soon (within 5 minutes)
  if (!authData || currentTime >= authExpiryTime - 300000) {
    try {
      authData = await authenticate("client_credentials", {
        clientId: config.clientId,
        scope: config.scope,
      });

      // Set expiry time in milliseconds
      authExpiryTime = new Date(authData.expires).getTime();

      // Save auth data to cookie
      // Cookie expiry should match token expiry
      const expiryInDays =
        (authExpiryTime - currentTime) / (1000 * 60 * 60 * 24);
      Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(authData), {
        expires: expiryInDays,
        secure: true,
        sameSite: "strict",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Failed to authenticate with Commerce Layer");
    }
  }

  return CommerceLayer({
    organization: config.organization,
    accessToken: authData.accessToken,
  });
}

// Fetch products with pagination
export async function getProducts(page: number): Promise<any> {
  try {
    const client = await getClient();

    const products = await client.skus.list({
      include: ["attachments", "prices"],
      pageNumber: page,
      pageSize: 9,
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products from Commerce Layer");
  }
}

// Add this utility to fetch a single product by ID
export async function getProductById(productId: string): Promise<any | null> {
  try {
    const client = await getClient();
    const product = await client.skus.retrieve(productId, {
      include: ["attachments", "prices"],
    });
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}
