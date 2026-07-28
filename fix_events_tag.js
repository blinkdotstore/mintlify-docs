const fs = require('fs');

const patchFile = (p) => {
    if (!fs.existsSync(p)) return;
    const data = JSON.parse(fs.readFileSync(p));
    let changed = false;

    if (data.paths && data.paths['/events'] && data.paths['/events'].get) {
        if (data.paths['/events'].get.tags && data.paths['/events'].get.tags.includes('Core')) {
            data.paths['/events'].get.tags = ['Events'];
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
