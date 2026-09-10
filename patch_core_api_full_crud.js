const fs = require('fs');
const coreApiFile = 'api-reference/core-api.json';
const coreApi = JSON.parse(fs.readFileSync(coreApiFile, 'utf8'));

if (!coreApi.components.schemas.CategoryCreateRequest) {
    coreApi.components.schemas.CategoryCreateRequest = {
        type: "object",
        properties: {
            name: { type: "string" },
            slug: { type: "string", description: "Optional slug for the category. If not provided, it is automatically generated from the name." }
        },
        required: ["name"]
    };
}
if (!coreApi.components.schemas.CategoryUpdateRequest) {
    coreApi.components.schemas.CategoryUpdateRequest = {
        type: "object",
        properties: {
            name: { type: "string" },
            slug: { type: "string" }
        }
    };
}

const standardResponse = {
    "200": {
        description: "A category object",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        meta: { type: "object", properties: { success: { type: "boolean" } } },
                        data: { $ref: "#/components/schemas/Category" }
                    }
                }
            }
        }
    }
};

coreApi.paths["/v1/categories"].post = {
    tags: ["Categories"],
    summary: "Create a category",
    description: "Create a new category for your products.",
    security: [{ ApiKeyAuth: [] }],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/CategoryCreateRequest" }
            }
        }
    },
    responses: standardResponse
};

coreApi.paths["/v1/categories/{id}"] = {
    get: {
        tags: ["Categories"],
        summary: "Retrieve a category",
        description: "Retrieve details of a specific category.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: standardResponse
    },
    patch: {
        tags: ["Categories"],
        summary: "Update a category",
        description: "Update the name or slug of an existing category.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/CategoryUpdateRequest" }
                }
            }
        },
        responses: standardResponse
    },
    delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        description: "Delete an existing category.",
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: standardResponse
    }
};

fs.writeFileSync(coreApiFile, JSON.stringify(coreApi, null, 2));
