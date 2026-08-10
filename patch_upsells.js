const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'api-reference/growth-api.json');
const apiData = JSON.parse(fs.readFileSync(apiPath, 'utf8'));

// 1. Add schemas
apiData.components = apiData.components || { schemas: {} };

apiData.components.schemas.Upsell = {
  type: "object",
  properties: {
    id: { type: "string" },
    store_id: { type: "string" },
    name: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    media_url: { type: "string" },
    button_text: { type: "string" },
    decline_text: { type: "string" },
    offer_product_id: { type: "string" },
    offer_variant_id: { type: "string" },
    discount_type: { type: "string", enum: ["fixed", "percentage_off", "amount_off"] },
    discount_value: { type: "number" },
    discounted_price: { type: "number" },
    show_original_price: { type: "boolean" },
    trigger_type: { type: "string", enum: ["all_products", "specific_products"] },
    trigger_rules: { type: "array", items: { type: "object" } },
    priority: { type: "integer" },
    timer_enabled: { type: "boolean" },
    timer_duration_minutes: { type: "integer" },
    preheader_color: { type: "string" },
    button_color: { type: "string" },
    button_hover_color: { type: "string" },
    button_text_color: { type: "string" },
    button_text_hover_color: { type: "string" }
  }
};

apiData.components.schemas.UpsellPerformance = {
  type: "object",
  properties: {
    id: { type: "string" },
    sales: { type: "integer" },
    revenue: { type: "number", description: "Revenue generated in major currency units" },
    test_sales: { type: "integer" },
    test_revenue: { type: "number" },
    views: { type: "integer" },
    declines: { type: "integer" },
    conversion_rate: { type: "number" }
  }
};

// 2. Add paths
apiData.paths["/upsells"] = {
  get: {
    tags: ["Upsells"],
    summary: "List all store upsells",
    description: "Returns a paginated list of all upsells for the authenticated store.",
    parameters: [
      {
        name: "status",
        in: "query",
        description: "Filter by status (active or inactive)",
        required: false,
        schema: { type: "string", enum: ["active", "inactive"] }
      },
      {
        name: "limit",
        in: "query",
        description: "Number of items to return",
        required: false,
        schema: { type: "integer" }
      },
      {
        name: "page",
        in: "query",
        description: "Page number to return",
        required: false,
        schema: { type: "integer" }
      }
    ],
    responses: {
      "200": {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "array", items: { "$ref": "#/components/schemas/Upsell" } },
                meta: { type: "object" }
              }
            }
          }
        }
      }
    }
  }
};

apiData.paths["/products/{id}/upsells"] = {
  get: {
    tags: ["Upsells"],
    summary: "Retrieve triggered upsells",
    description: "Fetches the active upsells configured to trigger when the specified product is purchased.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "The ID of the product being purchased",
        required: true,
        schema: { type: "string" }
      }
    ],
    responses: {
      "200": {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "array", items: { "$ref": "#/components/schemas/Upsell" } }
              }
            }
          }
        }
      }
    }
  }
};

apiData.paths["/upsells/{id}/events"] = {
  post: {
    tags: ["Upsells"],
    summary: "Track an upsell event",
    description: "Record a telemetry event (view or decline) when an upsell is presented on a custom frontend. This ensures accurate conversion metrics.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "The ID of the upsell",
        required: true,
        schema: { type: "string" }
      }
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["type"],
            properties: {
              type: { type: "string", enum: ["view", "decline"] }
            }
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Event successfully tracked"
      }
    }
  }
};

apiData.paths["/upsells/{id}/claim"] = {
  post: {
    tags: ["Upsells"],
    summary: "Claim an upsell offer",
    description: "Processes the off-session charge for an accepted upsell using the original order's payment intent. This automatically provisions deliverables and assigns them to the original order.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "The ID of the upsell being claimed",
        required: true,
        schema: { type: "string" }
      }
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["payment_intent_id"],
            properties: {
              payment_intent_id: { type: "string", description: "The Stripe Payment Intent ID of the original purchase" },
              idempotency_key: { type: "string", description: "Optional idempotency key to prevent double charging" }
            }
          }
        }
      }
    },
    responses: {
      "200": {
        description: "Upsell successfully claimed",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: {
                  type: "object",
                  properties: {
                    payment_intent_id: { type: "string" },
                    status: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

apiData.paths["/upsells/{id}/performance"] = {
  get: {
    tags: ["Upsells"],
    summary: "Retrieve upsell performance",
    description: "Retrieves the core metrics (sales, revenue, views, declines) for a specific upsell.",
    parameters: [
      {
        name: "id",
        in: "path",
        description: "The ID of the upsell",
        required: true,
        schema: { type: "string" }
      }
    ],
    responses: {
      "200": {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { "$ref": "#/components/schemas/UpsellPerformance" }
              }
            }
          }
        }
      }
    }
  }
};

fs.writeFileSync(apiPath, JSON.stringify(apiData, null, 2), 'utf8');
console.log('Successfully patched growth-api.json with Upsell endpoints.');
