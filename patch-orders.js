const fs = require('fs');

const file = 'api-reference/core-api.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 1. Update /orders and /orders/{id} responses if they don't have schemas
const ordersPath = data.paths['/orders'];
if (ordersPath && ordersPath.get && ordersPath.get.responses['200']) {
    ordersPath.get.responses['200'] = {
        description: "Successful response",
        content: {
            "application/json": {
                "schema": {
                    $ref: "#/components/schemas/CustomerOrdersResponse"
                }
            }
        }
    };
}

const orderIdPath = data.paths['/orders/{id}'];
if (orderIdPath && orderIdPath.get && orderIdPath.get.responses['200']) {
    orderIdPath.get.responses['200'] = {
        description: "Successful response",
        content: {
            "application/json": {
                "schema": {
                    type: "object",
                    properties: {
                        data: {
                            $ref: "#/components/schemas/CustomerOrdersResponse/properties/data/items"
                        }
                    }
                }
            }
        }
    };
}

// 2. Add bump_id and bump properties to CustomerOrdersResponse items
const items = data.components.schemas.CustomerOrdersResponse.properties.data.items;
items.properties.bump_id = { type: "string" };
items.properties.bump = {
    type: "object",
    properties: {
        id: { type: "string" },
        title: { type: "string" },
        price: { type: "number" },
        badge_title: { type: "string" },
        deliverables: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: { type: "string" },
                    title: { type: "string" },
                    metadata: { type: "object" }
                }
            }
        }
    }
};

// 3. Add bump_id and bump to CustomerDetailResponse order properties
// const customerDetailOrder = data.components.schemas.CustomerDetailResponse.properties.data.properties.recent_orders.items;
// customerDetailOrder.properties.bump_id = { type: "string" };
// customerDetailOrder.properties.bump = {
//     type: "object",
//     properties: {
//         id: { type: "string" },
//         title: { type: "string" },
//         price: { type: "number" },
//         deliverables: { type: "array" }
//     }
// };

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Successfully patched core-api.json for Orders');
