const fs = require('fs');

const readJSON = (file) => JSON.parse(fs.readFileSync('api-reference/' + file));
const writeJSON = (file, data) => fs.writeFileSync('api-reference/' + file, JSON.stringify(data, null, 2));

let core = readJSON('core-api.json');
let financials = readJSON('financials-api.json');
let growth = readJSON('growth-api.json');
let webhooks = readJSON('webhooks-api.json');

// 1. Move Meters from financials to core
if (financials.paths['/usage-records']) {
    core.paths['/usage-records'] = financials.paths['/usage-records'];
    delete financials.paths['/usage-records'];
}

// 2. Delete List events from core (assuming it's /events)
if (core.paths['/events']) {
    delete core.paths['/events'];
}

// 3. Rename "List Tracked Events" to "Event Delivery Log" in webhooks
if (webhooks.paths['/events'] && webhooks.paths['/events'].get) {
    webhooks.paths['/events'].get.summary = "Event Delivery Log";
} else if (webhooks.paths['/webhooks/events'] && webhooks.paths['/webhooks/events'].get) {
    webhooks.paths['/webhooks/events'].get.summary = "Event Delivery Log";
}

let corePathsToDelete = new Set();

Object.keys(core.paths).forEach(p => {
    Object.keys(core.paths[p]).forEach(m => {
        let op = core.paths[p][m];
        if (op.tags) {
            if (op.tags.includes('Audience') || op.tags.includes('Webhooks') || op.tags.includes('Webhook Events') || op.tags.includes('Subscription Invoices')) {
                corePathsToDelete.add(p);
            }
        }
    });
});

corePathsToDelete.forEach(p => delete core.paths[p]);

writeJSON('core-api.json', core);
writeJSON('financials-api.json', financials);
writeJSON('growth-api.json', growth);
writeJSON('webhooks-api.json', webhooks);

console.log("OpenAPI specs updated successfully.");
