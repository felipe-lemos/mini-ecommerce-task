# Mini Ecommerce Task

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   find the instructions on how to setup these on commercelayer here:
   [Guided organization setup.](https://docs.commercelayer.io/core/onboarding/guided-setup)
   [API Credentials.](https://docs.commercelayer.io/core/api-credentials)

   .env.local:

   ```bash
   NEXT_PUBLIC_COMMERCE_LAYER_CLIENT_ID=<YOUR CLIENT ID HERE>
   NEXT_PUBLIC_COMMERCE_LAYER_ENDPOINT=https://<YOUR ORGANIZATION SLUG HERE>.commercelayer.io
   NEXT_PUBLIC_COMMERCE_LAYER_SCOPE=<MARKET SCOPE HERE>
   NEXT_PUBLIC_COMMERCE_LAYER_ORGANIZATION=<YOUR ORGANIZATION SLUG HERE>
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Architecture & Key Design Decisions

- **Framework:** Built with Next.js 13+ (App Router, React 18, TypeScript).
- **SSR:**
  - As it's a simple mini e-commerce project, I've used the base page as the PLP.
  - The product list page (`/src/app/page.tsx`) uses server-side rendering to fetch and display products. Data is fetched on the server using an async function and passed to the client.
- **Dynamic Routing:**
  - Product detail pages are implemented using dynamic routes (`/src/app/products/[productId]/page.tsx`). Clicking a product navigates to its detail page, which fetches and displays detailed product info (name, description, price, image, etc.).
- **Add to Cart:**
  - Both PLP and PDP includes an "Add to Cart" button, allowing users to add the selected product (with quantity) to their cart.
- **Cart:**
  - Cart state is managed globally using React context (`/src/context/CartContext.tsx`). The cart icon and overlay are always accessible, showing current cart contents and allowing item removal.
- **Commerce Layer Integration:**
  - Product and price data are fetched from Commerce Layer using their SDK and API. Authentication is handled via cookies and a provider.
- **Styling:**
  - Uses Tailwind CSS utility classes for layout and styling.

---

## File Structure

- `src/app/page.tsx` — Product Listing Page
- `src/app/products/[productId]/page.tsx` — Product detail Page(dynamic route using code)
- `src/components/` — UI components (ProductGrid, CartIcon, CartOverlay, etc.)
- `src/context/CartContext.tsx` — Cart state management
- `src/lib/commerceLayer.ts` — API utilities for Commerce Layer (Fetch Products)
- `src/providers/CommerceLayerAuthProvider.tsx` — Handles authentication

---

## Extra notes on Architecture and design

- I have started building this using the SDK, but found out that some features would be harder to implement using only the SDK, so I decided to go for the REST Api for managing and fetching cart data.

- In the end, I have opted to use a Cart Context to manage everything cart related. With this approach I can add different contexts to manage different domains within my website.
