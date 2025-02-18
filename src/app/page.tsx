"use client";
import { useState, useEffect, useRef } from "react";

interface Variant {
  id: string;
  title: string;
  price: string;
  quantity: number;
  productId: string; 
}

interface Product {
  id: string;
  title: string;
  variants: Variant[];
}

export default function Home() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const cartItems = products.flatMap((product) =>
    product.variants.filter((variant) => variant.quantity > 0)
  );

  // Refs for scrolling
  const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch customers
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  // Fetch products with variants
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  // Handle quantity change
  const handleQuantityChange = (productId: string, variantId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId ? { ...v, quantity } : v
              ),
            }
          : p
      )
    );
  };

  // Function to remove an item (set quantity to 0)
  const removeFromCart = (productId: string, variantId: string) => {
    setProducts((prev) =>
      prev.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId ? { ...variant, quantity: 0 } : variant
        ),
      }))
    );
  };

  // Scroll to product section
  const scrollToProduct = (productId: string) => {
    const element = productRefs.current[productId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
    {/* Floating Product Navigation (Left) */}
    <div className="fixed left-4 top-20 w-40 h-80 bg-white shadow-md p-3 rounded-lg hidden lg:block overflow-y-auto">
      <h2 className="text-md font-semibold mb-2 text-center">Products</h2>
      <ul className="space-y-1">
        {products.map((product) => (
          <li key={product.id} className="flex items-center space-x-2">
            <span className="text-gray-500 text-lg">•</span> 
            <button
              onClick={() => scrollToProduct(product.id)}
              className="text-black hover:underline text-sm"
            >
              {product.title}
            </button>
          </li>
        ))}
      </ul>
    </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto p-8">
        <img src="/assets/milkdk.svg" alt="Milk Logo" className="w-25 h-25 mx-auto pb-[15px]" />

        {/* Customer Selection */}
        <div className="mb-6">
          <select
            onChange={(e) => {
              const customer = customers.find((c) => c.id === e.target.value) || null;
              setSelectedCustomer(customer);
            }}
            className="w-full border border-gray-300 rounded-md p-2 text-center"
          >
            <option value="">-- Choose a Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Products & Variants */}
        {products.map((product) => (
          <div key={product.id} ref={(el) => {  if (el) productRefs.current[product.id] = el;}}
          className="mb-8"
        >
            {/* Table for Product & Variants */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                {/* Product Header as Table Header */}
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 p-3 text-center text-lg" colSpan={3}>
                      {product.title}
                    </th>
                  </tr>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2">Variant</th>
                    <th className="border border-gray-300 p-2">Price</th>
                    <th className="border border-gray-300 p-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="text-center">
                      <td className="border border-gray-300 p-2">{variant.title}</td>
                      <td className="border border-gray-300 p-2">${variant.price}</td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          min="0"
                          value={variant.quantity}
                          onChange={(e) =>
                            handleQuantityChange(product.id, variant.id, parseInt(e.target.value))
                          }
                          className="w-16 border border-gray-300 p-1 text-center"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Summary (Right) */}
      <div className="fixed right-4 top-20 w-60 bg-white shadow-md p-4 rounded-lg hidden lg:block">
        <h2 className="text-md font-semibold mb-2">🛒 Cart Summary</h2>
        {cartItems.length === 0 ? (
          <p className="text-sm text-gray-500">No items selected</p>
        ) : (
          <ul className="text-sm space-y-2">
            {cartItems.map((variant) => {
              console.log("Cart Item:", variant); 
              return (
                <li key={variant.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(variant.productId, variant.id)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                    <span>{variant.title}</span>
                  </div>
                  <span>{variant.quantity} x ${variant.price}</span>
                </li>
              );
            })}
          </ul>
        )}
        <hr className="my-2" />
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>
            $
            {cartItems
              .reduce((sum, v) => sum + parseFloat(v.price) * v.quantity, 0)
              .toFixed(2)}
          </span>
        </div>
        <button
          className="w-full mt-3 bg-black text-white p-2 rounded-md hover:bg-gray-800 transition"
          disabled={cartItems.length === 0}
        >
          Submit Order
        </button>
      </div>
    </div>
  );
}