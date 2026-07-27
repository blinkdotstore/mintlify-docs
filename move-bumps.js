const fs = require('fs');
const coreFile = 'api-reference/core-api.json';
const growthFile = 'api-reference/growth-api.json';

let coreData = JSON.parse(fs.readFileSync(coreFile, 'utf8'));
let growthData = JSON.parse(fs.readFileSync(growthFile, 'utf8'));

// 1. Extract endpoints from core-api.json
const bumpsEndpoint = coreData.paths['/bumps'];
const bumpsIdEndpoint = coreData.paths['/bumps/{id}'];

if (bumpsEndpoint && bumpsIdEndpoint) {
    // 2. Add to growth-api.json
    growthData.paths['/bumps'] = bumpsEndpoint;
    growthData.paths['/bumps/{id}'] = bumpsIdEndpoint;
    
    // Add GET /bumps/{id} since we just created it
    if (!growthData.paths['/bumps/{id}'].get) {
        growthData.paths['/bumps/{id}'].get = {
            tags: ["Bumps"],
            summary: "Retrieve a bump",
            description: "Fetches detailed information for a specific bump, including deliverables.",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }
            ],
            responses: {
                "200": {
                    description: "Successful response"
                }
            }
        };
    }

    // Safely update all tags to 'Bumps'
    ['/bumps', '/bumps/{id}'].forEach(path => {
        Object.keys(growthData.paths[path]).forEach(method => {
            growthData.paths[path][method].tags = ['Bumps'];
        });
    });
    
    // Remove from core-api.json
    delete coreData.paths['/bumps'];
    delete coreData.paths['/bumps/{id}'];

    fs.writeFileSync(coreFile, JSON.stringify(coreData, null, 2));
    fs.writeFileSync(growthFile, JSON.stringify(growthData, null, 2));
    console.log('Successfully moved bumps to growth-api.json and added GET /bumps/{id}');
} else {
    console.log('Endpoints not found in core-api.json');
}
