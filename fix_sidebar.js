const fs = require('fs');
const path = require('path');

function getPagesInDir(dir) {
    const fullDir = path.join('api-reference', dir);
    if (!fs.existsSync(fullDir)) return [];
    return fs.readdirSync(fullDir)
        .filter(f => f.endsWith('.mdx'))
        .map(f => `api-reference/${dir}/${f.replace('.mdx', '')}`);
}

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
                { "group": "Products", "pages": getPagesInDir('products') },
                { "group": "Checkouts", "pages": getPagesInDir('checkouts') },
                "api-reference/embedded-checkout",
                { "group": "Orders", "pages": getPagesInDir('orders') },
                { "group": "Customers", "pages": getPagesInDir('customers') },
                { "group": "Subscriptions", "pages": getPagesInDir('subscriptions') },
                { "group": "Customer Portal", "pages": getPagesInDir('customer-portal') },
                { "group": "Meters", "pages": getPagesInDir('meters') },
                { "group": "Deliverables", "pages": getPagesInDir('deliverables') },
                { "group": "License Keys", "pages": getPagesInDir('license-keys') },
                { "group": "Organizations", "pages": getPagesInDir('organizations') },
                { "group": "Metrics", "pages": getPagesInDir('metrics') }
            ]
        },
        {
            "group": "Financials",
            "pages": [
                { "group": "Invoices", "pages": getPagesInDir('invoices') },
                { "group": "Subscription Invoices", "pages": getPagesInDir('subscription-invoices') },
                { "group": "Payouts", "pages": getPagesInDir('payouts') },
                { "group": "Refunds", "pages": getPagesInDir('refunds') },
                { "group": "Disputes", "pages": getPagesInDir('disputes') },
                { "group": "Taxes", "pages": getPagesInDir('taxes') },
                { "group": "Payees", "pages": getPagesInDir('payees') }
            ]
        },
        {
            "group": "Growth & Marketing",
            "pages": [
                { "group": "Discounts", "pages": getPagesInDir('discounts') },
                { "group": "Bumps", "pages": getPagesInDir('bumps') },
                { "group": "Cart Recovery", "pages": getPagesInDir('cart-recovery') },
                { "group": "Affiliates", "pages": getPagesInDir('affiliates') },
                { "group": "Splits", "pages": getPagesInDir('splits') },
                { "group": "Geo Pricing", "pages": getPagesInDir('geo-pricing') },
                { "group": "Audience", "pages": getPagesInDir('audience') }
            ]
        },
        {
            "group": "Webhooks & Events",
            "pages": [
                "api-reference/webhook-events",
                "api-reference/webhooks/webhook-signatures",
                { "group": "Webhooks", "pages": getPagesInDir('webhooks') }
            ]
        }
    ];
}

fs.writeFileSync('docs.json', JSON.stringify(data, null, 2));
console.log("docs.json sidebar updated successfully with explicit pages.");
