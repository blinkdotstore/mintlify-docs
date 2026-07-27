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

  const ensurePath = (pathStr) => {
      if (!data.paths[pathStr]) data.paths[pathStr] = {};
      return data.paths[pathStr];
  };

  // Add all routes/methods to ALL files just in case, or only if the base route exists?
  // It's safer to just inject them if the tags match the file's primary focus, but for simplicity we can just try to see if the file handles that resource.
  
  const addIfContextMatches = (pathStr, method, obj) => {
     // Core API handles Subscriptions, Products, Deliverables, Orders, Customers, etc.
     // Growth API handles Affiliates, Bumps, Cart Recovery, Audience
     // Financials API handles Invoices, Payouts, Balances, Refunds, Taxes
     
     const tag = obj.tags[0];
     let targetFile = 'core-api.json';
     if (['Affiliates', 'Bumps', 'Cart Recovery', 'Audience', 'Discounts'].includes(tag)) targetFile = 'growth-api.json';
     if (['Meters', 'Payouts', 'Invoices', 'Refunds', 'Taxes', 'Balances', 'Subscription Invoices', 'Splits'].includes(tag)) targetFile = 'financials-api.json';
     if (tag === 'Webhooks') targetFile = 'webhooks-api.json';
     
     if (file.includes(targetFile)) {
         ensurePath(pathStr)[method] = obj;
     }
  };

  addIfContextMatches('/affiliates/programs', 'get', { tags: ['Affiliates'], summary: 'List affiliate programs', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members', 'get', { tags: ['Affiliates'], summary: 'List affiliate members', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members/{membership_id}/finances', 'get', { tags: ['Affiliates'], summary: 'Get affiliate finances', parameters: [{ name: 'membership_id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members/{membership_id}/links', 'get', { tags: ['Affiliates'], summary: 'List affiliate links', parameters: [{ name: 'membership_id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members/{membership_id}/links', 'post', { tags: ['Affiliates'], summary: 'Create affiliate link', parameters: [{ name: 'membership_id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members/{membership_id}/metrics', 'get', { tags: ['Affiliates'], summary: 'Get affiliate metrics', parameters: [{ name: 'membership_id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/affiliates/members/{membership_id}/orders', 'get', { tags: ['Affiliates'], summary: 'List affiliate orders', parameters: [{ name: 'membership_id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/cart-recovery/{id}/link', 'get', { tags: ['Cart Recovery'], summary: 'Get recovery link', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });

  addIfContextMatches('/audience/broadcasts', 'get', { tags: ['Audience'], summary: 'List all broadcasts', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/audience/tags', 'get', { tags: ['Audience'], summary: 'List all tags', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/audience/tags', 'delete', { tags: ['Audience'], summary: 'Delete a tag', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/bumps/{id}', 'get', { tags: ['Bumps'], summary: 'Retrieve a specific bump', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/cart-recovery/{id}', 'delete', { tags: ['Cart Recovery'], summary: 'Delete a cart recovery campaign', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  
  addIfContextMatches('/deliverables', 'post', {
      tags: ['Deliverables'], summary: 'Upload a deliverable',
      requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, product_id: { type: 'string' } } } } } },
      responses: { '200': { description: 'OK' } }
  });

  addIfContextMatches('/events', 'get', { tags: ['Core'], summary: 'List events', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/license-keys', 'post', { tags: ['License Keys'], summary: 'Create license key manually', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/organizations/{id}/members', 'post', { tags: ['Organizations'], summary: 'Add a member to an organization', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/organizations/{id}', 'delete', { tags: ['Organizations'], summary: 'Delete an organization', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/subscription-invoices/{id}', 'patch', { tags: ['Subscription Invoices'], summary: 'Update a subscription invoice', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/subscriptions', 'post', { tags: ['Subscriptions'], summary: 'Create a subscription manually', responses: { '200': { description: 'OK' } } });
  addIfContextMatches('/usage-records', 'get', { tags: ['Meters'], summary: 'List usage records', responses: { '200': { description: 'OK' } } });

  // preview-swap fix
  if (data.paths['/subscriptions/{id}/preview-swap'] && data.paths['/subscriptions/{id}/preview-swap'].post) {
      data.paths['/subscriptions/{id}/preview-swap'].get = {
          tags: data.paths['/subscriptions/{id}/preview-swap'].post.tags || ['Subscriptions'],
          summary: 'Preview a subscription swap',
          description: 'Preview the prorated invoice amounts for a potential subscription swap.',
          parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'variant_id', in: 'query', required: false, schema: { type: 'string' } },
              { name: 'product_id', in: 'query', required: false, schema: { type: 'string' } },
              { name: 'x-store-id', in: 'header', required: true, schema: { type: 'string' } }
          ],
          responses: data.paths['/subscriptions/{id}/preview-swap'].post.responses || { '200': { description: 'OK' } }
      };
      delete data.paths['/subscriptions/{id}/preview-swap'].post;
  }

  if (data.components && data.components.schemas) {
      const subUpdateSchema = data.components.schemas.SubscriptionUpdateRequest;
      if (subUpdateSchema && subUpdateSchema.properties && subUpdateSchema.properties.action) {
          if (!subUpdateSchema.properties.action.enum.includes('swap')) {
              subUpdateSchema.properties.action.enum.push('swap');
          }
          subUpdateSchema.properties.variant_id = { type: 'string', description: 'Required if action is swap' };
          subUpdateSchema.properties.product_id = { type: 'string', description: 'Required if action is swap' };
      }

      const addEnums = (schemaObj) => {
          if (!schemaObj) return;
          if (schemaObj.properties) {
              if (schemaObj.properties.subscription_interval && !schemaObj.properties.subscription_interval.enum) {
                  schemaObj.properties.subscription_interval.enum = ['day', 'week', 'month', 'year'];
              }
              if (schemaObj.properties.pricing_model && !schemaObj.properties.pricing_model.enum) {
                  schemaObj.properties.pricing_model.enum = ['one_time', 'subscription', 'pay_what_you_want'];
              }
          }
          for (const key in schemaObj) {
              if (typeof schemaObj[key] === 'object' && schemaObj[key] !== null) {
                  addEnums(schemaObj[key]);
              }
          }
      };
      addEnums(data.components.schemas);
  }

  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log('Patched ' + file);
}
