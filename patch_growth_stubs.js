const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    const resolveStub = (path, method, description, properties) => {
        if (data.paths && data.paths[path] && data.paths[path][method]) {
            const op = data.paths[path][method];
            
            // Remove errant tags like Splits from Affiliates
            if (op.tags && op.tags.includes('Splits') && op.tags.includes('Affiliates')) {
                op.tags = op.tags.filter(t => t !== 'Splits');
                changed = true;
            }

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
    
    // Patch Growth API Affiliates
    resolveStub('/affiliates/members/{membership_id}/finances', 'get', 'Financial metrics for the affiliate.', {
        available_balance: { type: 'integer' },
        pending_balance: { type: 'integer' },
        total_earned: { type: 'integer' }
    });
    
    resolveStub('/affiliates/members/{membership_id}/metrics', 'get', 'Performance metrics for the affiliate.', {
        clicks: { type: 'integer' },
        conversions: { type: 'integer' },
        conversion_rate: { type: 'number' }
    });
    
    resolveStub('/affiliates/members/{membership_id}/orders', 'get', 'List of orders attributed to the affiliate.', {
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

    resolveStub('/affiliates/links', 'post', 'A new affiliate link.', {
        id: { type: 'string' },
        url: { type: 'string' },
        code: { type: 'string' }
    });
    
    // Also clear the stray tags from get-affiliate-finances
    if (data.paths['/affiliates/members/{membership_id}/finances'] && data.paths['/affiliates/members/{membership_id}/finances'].get) {
        let tags = data.paths['/affiliates/members/{membership_id}/finances'].get.tags;
        if (tags && tags.includes('Splits')) {
            data.paths['/affiliates/members/{membership_id}/finances'].get.tags = tags.filter(t => t !== 'Splits');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
        console.log('Patched ' + p);
    }
};

patchFile('api-reference/growth-api.json');
