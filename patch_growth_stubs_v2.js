const fs = require('fs');
const p = 'api-reference/growth-api.json';
const data = JSON.parse(fs.readFileSync(p));
let changed = false;

if (data.paths['/affiliates/members/{membership_id}/links'] && data.paths['/affiliates/members/{membership_id}/links'].post) {
    let op = data.paths['/affiliates/members/{membership_id}/links'].post;
    if (op.responses && op.responses['200']) {
        op.responses['200'].content = {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        meta: { type: 'object', properties: { success: { type: 'boolean' } } },
                        data: {
                            type: 'object',
                            description: 'A new affiliate link.',
                            properties: {
                                id: { type: 'string' },
                                url: { type: 'string' },
                                code: { type: 'string' }
                            }
                        }
                    }
                }
            }
        };
        changed = true;
    }
}

// Ensure tags are cleaned up for all affiliate endpoints
Object.keys(data.paths).forEach(path => {
    Object.keys(data.paths[path]).forEach(method => {
        let op = data.paths[path][method];
        if (op.tags) {
            let hasAffiliates = op.tags.includes('Affiliates');
            let hasSplits = op.tags.includes('Splits');
            let hasPayees = op.tags.includes('Payees');
            
            if (hasAffiliates && hasSplits) {
                op.tags = op.tags.filter(t => t !== 'Splits');
                changed = true;
            }
            if (hasAffiliates && hasPayees) {
                op.tags = op.tags.filter(t => t !== 'Payees');
                changed = true;
            }
        }
    });
});

if (changed) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    console.log('Patched ' + p);
}
