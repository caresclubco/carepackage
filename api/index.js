import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/api", async (req, res) => {
  const { metaobject } = req.body;

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN
        },
        body: JSON.stringify({
          query: `
            mutation CreateMetaobject {
              metaobjectCreate(metaobject: {
                type: "care_package_request",
                fields: [
                  { key: "email", value: "${metaobject.fields.find(f => f.key === "email").value}" },
                  { key: "wallet_address", value: "${metaobject.fields.find(f => f.key === "wallet_address").value}" },
                  { key: "service", value: "${metaobject.fields.find(f => f.key === "service").value}" },
                  { key: "message", value: "${metaobject.fields.find(f => f.key === "message").value}" },
                  { key: "tx_hash", value: "${metaobject.fields.find(f => f.key === "tx_hash").value}" },
                  { key: "status", value: "${metaobject.fields.find(f => f.key === "status").value}" },
                  { key: "created_at", value: "${metaobject.fields.find(f => f.key === "created_at").value}" }
                ]
              }) {
                metaobject { id }
                userErrors { field message }
              }
            }
          `
        })
      }
    );

    const result = await response.json();
    if (result.errors || result.data.metaobjectCreate.userErrors.length > 0) {
      return res.status(400).json({ error: result });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Care Package Handler running on port ${PORT}`);
});