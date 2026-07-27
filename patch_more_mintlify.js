const fs = require('fs');
const path = require('path');

const files = [
  'api-reference/core-api.json',
  'api-reference/growth-api.json',
  'api-reference/financials-api.json',
  'api-reference/webhooks-api.json'
];

for (const file of files) {
  const p = path.resolve(file);
  if (!fs.existsSync(p)) continue;
  
  const data = JSON.parse(fs.readFileSync(p));

  // 1. Add requestBody to POST /subscriptions
  if (data.paths['/subscriptions'] && data.paths['/subscriptions'].post) {
      data.paths['/subscriptions'].post.requestBody = {
          required: true,
          content: {
              'application/json': {
                  schema: {
                      type: 'object',
                      required: ['product_id', 'customer_id'],
                      properties: {
                          product_id: { type: 'string', description: 'ID of the product' },
                          customer_id: { type: 'string', description: 'ID of the customer' },
                          variant_id: { type: 'string', description: 'ID of the variant (optional)' },
                          status: { type: 'string', default: 'active', enum: ['active', 'trialing', 'canceled', 'past_due', 'paused'] }
                      }
                  }
              }
          }
      };
      data.paths['/subscriptions'].post.parameters = [
          { name: 'x-store-id', in: 'header', required: true, schema: { type: 'string' } }
      ];
      data.paths['/subscriptions'].post.description = 'Manually create a subscription for a customer. This bypasses checkout and directly assigns the subscription.';
  }

  // 2. Update PATCH /subscriptions/{id} description to explicitly mention swaps
  if (data.paths['/subscriptions/{id}'] && data.paths['/subscriptions/{id}'].patch) {
      data.paths['/subscriptions/{id}'].patch.summary = 'Update or swap a subscription';
      data.paths['/subscriptions/{id}'].patch.description = 'Updates the status of a subscription, allowing actions such as cancelation, immediate cancelation, resumption, or executing a **swap** (upgrade/downgrade). To execute a swap, set `action` to `swap` and provide `variant_id` or `product_id` in the body.';
  }

  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log('Patched ' + file);
}
