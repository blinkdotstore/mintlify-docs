const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    // 1. Add has_metered and metered_prices to ProductCreateRequest and ProductUpdateRequest
    if (data.components && data.components.schemas) {
        ['ProductCreateRequest', 'ProductUpdateRequest'].forEach(schemaName => {
            if (data.components.schemas[schemaName] && data.components.schemas[schemaName].properties) {
                if (!data.components.schemas[schemaName].properties.has_metered) {
                    data.components.schemas[schemaName].properties.has_metered = { type: 'boolean', description: 'Enable metered billing for overages' };
                    changed = true;
                }
                if (!data.components.schemas[schemaName].properties.metered_prices) {
                    data.components.schemas[schemaName].properties.metered_prices = {
                        type: 'array',
                        description: 'Configure your overage pricing tiers here. If a user exceeds their deliverable grant, they will be billed at these rates.',
                        items: {
                            type: 'object',
                            properties: {
                                up_to: { type: 'integer', description: 'The upper threshold for this tier (or null for infinite)' },
                                unit_amount: { type: 'integer', description: 'The price per unit in cents' }
                            }
                        }
                    };
                    changed = true;
                }
            }
        });
    }

    // 2. Add success response to POST /usage-records
    if (data.paths && data.paths['/usage-records'] && data.paths['/usage-records'].post) {
        if (!data.paths['/usage-records'].post.responses['200']) {
            data.paths['/usage-records'].post.responses['200'] = {
                description: 'Usage record successfully reported to Stripe.',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                meta: { type: 'object', properties: { success: { type: 'boolean' } } },
                                data: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        quantity: { type: 'integer' },
                                        meter_event_name: { type: 'string' },
                                        action: { type: 'string' },
                                        created_at: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            changed = true;
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
