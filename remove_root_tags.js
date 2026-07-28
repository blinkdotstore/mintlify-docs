const fs = require('fs');

const files = ['core-api.json', 'growth-api.json', 'financials-api.json', 'webhooks-api.json'];

files.forEach(f => {
    const p = 'api-reference/' + f;
    if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p));
        if (data.tags) {
            delete data.tags;
            fs.writeFileSync(p, JSON.stringify(data, null, 2));
            console.log('Removed root tags from ' + f);
        }
    }
});
