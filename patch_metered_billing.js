const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));

    // Update metered_prices description
    if (data.components && data.components.schemas) {
        const updateSchema = (schemaObj) => {
            if (!schemaObj) return;
            if (schemaObj.properties && schemaObj.properties.metered_prices) {
                schemaObj.properties.metered_prices.description = "Configure your overage pricing here. If a user exceeds their deliverable grant, they will be billed at these rates.";
            }
            for (const key in schemaObj) {
                if (typeof schemaObj[key] === 'object' && schemaObj[key] !== null) {
                    updateSchema(schemaObj[key]);
                }
            }
        };
        updateSchema(data.components.schemas);
    }

    // Update POST /usage-records description
    if (data.paths && data.paths['/usage-records'] && data.paths['/usage-records'].post) {
        data.paths['/usage-records'].post.description = "Pushes usage directly to Stripe's v2 Meter Events API. Overages are automatically calculated against the product's metered_prices and billed at the end of the cycle. Note: This endpoint does not return a synchronous 'new balance' due to Stripe's asynchronous invoice calculation. Rely on webhooks for final billing amounts.";
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    console.log('Patched ' + p);
};

patchFile('../blink/public/openapi.json');
patchFile('api-reference/core-api.json');
patchFile('api-reference/growth-api.json');
patchFile('api-reference/financials-api.json');
patchFile('api-reference/webhooks-api.json');
