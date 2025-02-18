import { shopifyGraphQL } from "../../src/shopify/shopify";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const query = `
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query);

    const products = data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      variants: node.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        price: node.price,
        quantity: 0, // Default quantity
      })),
    }));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}