const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    // 1. POST /portal/sessions - remove requestBody (if it exists) and add description
    if (data.paths && data.paths['/portal/sessions'] && data.paths['/portal/sessions'].post) {
        delete data.paths['/portal/sessions'].post.requestBody;
        data.paths['/portal/sessions'].post.description = 'Creates a Stripe billing portal session. Note: This endpoint does not take a request body because the customer ID is derived from the required Customer Bearer token (JWT).';
        changed = true;
    }

    // 2. Affiliate endpoints
    if (data.paths && data.paths['/affiliates/links'] && data.paths['/affiliates/links'].post) {
        data.paths['/affiliates/links'].post.requestBody = {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['membership_id', 'code'], properties: { membership_id: { type: 'string' }, code: { type: 'string' } } } } }
        };
        data.paths['/affiliates/links'].post.responses['201'] = {
            description: 'Created',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string' }, code: { type: 'string' } } } } } } }
        };
        changed = true;
    }

    // Deliverables POST response
    if (data.paths && data.paths['/deliverables'] && data.paths['/deliverables'].post) {
        data.paths['/deliverables'].post.responses['200'] = {
            description: 'Success',
            content: { 'application/json': { schema: { type: 'object', properties: { meta: { type: 'object', properties: { success: { type: 'boolean' } } }, data: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } } } } } } }
        };
        changed = true;
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
