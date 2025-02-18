import { shopifyGraphQL } from "../../src/shopify/shopify";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const query = `
    {
      customers(first: 10) {
        edges {
          node {
            id
            tags
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query);

    console.log("🔍 Shopify API Raw Response:", JSON.stringify(data, null, 2)); // ✅ Debugging log

    if (!data || !data.customers || !Array.isArray(data.customers.edges)) {
      console.error("❌ Unexpected Shopify API response format:", data);
      return res.status(500).json({ error: "Invalid Shopify API response" });
    }

    const customers = data.customers.edges.map(({ node }) => {
      const tags = node.tags || [];
      const firstNameTag = tags.find(tag => tag.startsWith("first: "));
      const lastNameTag = tags.find(tag => tag.startsWith("last: "));

      return {
        id: node.id,
        firstName: firstNameTag ? firstNameTag.replace("first: ", "") : "Unknown",
        lastName: lastNameTag ? lastNameTag.replace("last: ", "") : "Customer"
      };
    });

    console.log("✅ Formatted Customers:", customers);

    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Shopify API Error:", error);
    res.status(500).json({ error: error.message });
  }
}