const fs = require('fs');

let data = JSON.parse(fs.readFileSync('docs.json'));

let nav = data.navigation.tabs;

let apiRefIndex = nav.findIndex(n => n.tab === "API");

if (apiRefIndex !== -1) {
    nav[apiRefIndex].pages = [
        "api-reference/introduction",
        "api-reference/authentication",
        "api-reference/errors",
        {
            "group": "Core",
            "pages": [
                { "group": "Products", "openapi": "api-reference/core-api.json" },
                { "group": "Checkouts", "openapi": "api-reference/core-api.json" },
                "api-reference/embedded-checkout",
                { "group": "Orders", "openapi": "api-reference/core-api.json" },
                { "group": "Customers", "openapi": "api-reference/core-api.json" },
                { "group": "Subscriptions", "openapi": "api-reference/core-api.json" },
                { "group": "Customer Portal", "openapi": "api-reference/core-api.json" },
                { "group": "Meters", "openapi": "api-reference/core-api.json" },
                { "group": "Deliverables", "openapi": "api-reference/core-api.json" },
                { "group": "License Keys", "openapi": "api-reference/core-api.json" },
                { "group": "Organizations", "openapi": "api-reference/core-api.json" },
                { "group": "Metrics", "openapi": "api-reference/core-api.json" }
            ]
        },
        {
            "group": "Financials",
            "pages": [
                { "group": "Invoices", "openapi": "api-reference/financials-api.json" },
                { "group": "Subscription Invoices", "openapi": "api-reference/financials-api.json" },
                { "group": "Payouts", "openapi": "api-reference/financials-api.json" },
                { "group": "Refunds", "openapi": "api-reference/financials-api.json" },
                { "group": "Disputes", "openapi": "api-reference/financials-api.json" },
                { "group": "Taxes", "openapi": "api-reference/financials-api.json" },
                { "group": "Payees", "openapi": "api-reference/financials-api.json" }
            ]
        },
        {
            "group": "Growth & Marketing",
            "pages": [
                { "group": "Discounts", "openapi": "api-reference/growth-api.json" },
                { "group": "Bumps", "openapi": "api-reference/growth-api.json" },
                { "group": "Cart Recovery", "openapi": "api-reference/growth-api.json" },
                { "group": "Affiliates", "openapi": "api-reference/growth-api.json" },
                { "group": "Splits", "openapi": "api-reference/growth-api.json" },
                { "group": "Geo Pricing", "openapi": "api-reference/growth-api.json" },
                { "group": "Audience", "openapi": "api-reference/growth-api.json" }
            ]
        },
        {
            "group": "Webhooks & Events",
            "pages": [
                "api-reference/webhook-events",
                "api-reference/webhook-signatures",
                { "group": "Webhooks", "openapi": "api-reference/webhooks-api.json" }
            ]
        }
    ];
}

fs.writeFileSync('docs.json', JSON.stringify(data, null, 2));
console.log("docs.json sidebar updated successfully.");
