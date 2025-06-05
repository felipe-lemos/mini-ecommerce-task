import { getProducts } from "@/lib/commerceLayer";
import { ProductGrid } from "@/components/ProductGrid";

interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const pageParam = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams?.page;

  const page = parseInt(pageParam || "1", 10);
  const productsResponse = await getProducts(page);
  const products = productsResponse || [];
  const hasNextPage = products.length === 9; // pageSize is 9 in getProducts

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <ProductGrid products={products} />
      <div className="flex justify-center gap-4 mt-8">
        <a
          href={`?page=${page - 1}`}
          className={`px-4 py-2 border rounded ${
            page === 1 ? "opacity-50 pointer-events-none" : ""
          }`}
          aria-disabled={page === 1}
        >
          Previous
        </a>
        <span className="px-4 py-2">Page {page}</span>
        <a
          href={`?page=${page + 1}`}
          className={`px-4 py-2 border rounded ${
            !hasNextPage ? "opacity-50 pointer-events-none" : ""
          }`}
          aria-disabled={!hasNextPage}
        >
          Next
        </a>
      </div>
    </main>
  );
}
