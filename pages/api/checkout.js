import { shopifyGraphQL } from "../../src/shopify/shopify";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { customerEmail, lineItems } = req.body; 

  const mutation = `
    mutation createOrder($input: OrderInput!) {
      orderCreate(input: $input) {
        order {
          id
          name
          totalPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email: customerEmail,
      lineItems,
      financialStatus: "PAID"
    }
  };

  try {
    const data = await shopifyGraphQL(mutation, variables);
    res.status(200).json(data.orderCreate.order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}