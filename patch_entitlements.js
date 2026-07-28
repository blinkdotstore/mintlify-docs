const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    // Add GET /customers/{id}/entitlements
    if (data.paths && data.paths['/customers/{id}']) {
        if (!data.paths['/customers/{id}/entitlements']) {
            data.paths['/customers/{id}/entitlements'] = {
                get: {
                    tags: ['Customers'],
                    summary: 'List customer entitlements',
                    description: 'Retrieve the active entitlements (feature flags) granted to a customer based on their active orders and subscriptions.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Success',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            meta: { type: 'object', properties: { total: { type: 'integer' } } },
                                            data: {
                                                type: 'object',
                                                additionalProperties: { type: 'string' },
                                                description: 'A key-value map of active entitlements.'
                                            }
                                        }
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
