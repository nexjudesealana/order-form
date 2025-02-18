export async function shopifyGraphQL(query, variables = {}) {
    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
        throw new Error("Missing Shopify credentials");
      }

    const response = await fetch(process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });
  
    const json = await response.json();
    if (json.errors) {
      console.error("Shopify API Error:", json.errors);
      throw new Error("Failed to fetch Shopify data");
    }
    return json.data;
  }