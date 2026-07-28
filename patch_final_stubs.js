const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    const resolveStub = (path, method, schemaKey, description, properties) => {
        if (data.paths && data.paths[path] && data.paths[path][method]) {
            const op = data.paths[path][method];
            if (op.responses && op.responses['200']) {
                op.responses['200'].content = {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                meta: { type: 'object', properties: { success: { type: 'boolean' } } },
                                data: {
                                    type: 'object',
                                    description: description,
                                    properties: properties
                                }
                            }
                        }
                    }
                };
                changed = true;
            }
        }
    };

    // Core API
    resolveStub('/license-keys', 'post', 'LicenseKey', 'A license key object.', {
        id: { type: 'string' },
        key: { type: 'string' },
        product_id: { type: 'string' },
        status: { type: 'string' }
    });

    // Growth API
    resolveStub('/affiliates/{id}/finances', 'get', 'AffiliateFinances', 'Financial metrics for the affiliate.', {
        available_balance: { type: 'integer' },
        pending_balance: { type: 'integer' },
        total_earned: { type: 'integer' }
    });
    
    resolveStub('/affiliates/{id}/metrics', 'get', 'AffiliateMetrics', 'Performance metrics for the affiliate.', {
        clicks: { type: 'integer' },
        conversions: { type: 'integer' },
        conversion_rate: { type: 'number' }
    });
    
    resolveStub('/affiliates/{id}/orders', 'get', 'AffiliateOrders', 'List of orders attributed to the affiliate.', {
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    amount: { type: 'integer' },
                    commission: { type: 'integer' }
                }
            }
        }
    });

    resolveStub('/affiliate-links', 'post', 'AffiliateLink', 'A new affiliate link.', {
        id: { type: 'string' },
        url: { type: 'string' },
        code: { type: 'string' }
    });

    // Financials API
    resolveStub('/subscriptions/{id}/invoice', 'patch', 'SubscriptionInvoice', 'The updated subscription invoice details.', {
        id: { type: 'string' },
        status: { type: 'string' },
        amount_due: { type: 'integer' }
    });

    // Fix Duplicate Metrics endpoint
    if (data.paths && data.paths['/metrics']) {
        if (data.paths['/metrics'].get && data.paths['/metrics'].get.tags) {
             const idx = data.paths['/metrics'].get.tags.indexOf('Webhooks');
             if (idx > -1) {
                 data.paths['/metrics'].get.tags.splice(idx, 1);
                 changed = true;
             }
        }
    }

    if (changed) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
        console.log('Patched ' + p);
    }
};

patchFile('../blink/public/openapi.json');
patchFile('api-reference/core-api.json');
patchFile('api-reference/growth-api.json');
patchFile('api-reference/financials-api.json');
patchFile('api-reference/webhooks-api.json');
