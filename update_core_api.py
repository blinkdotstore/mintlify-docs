import json

with open('api-reference/core-api.json', 'r') as f:
    data = json.load(f)

new_presigned = {
    "post": {
        "tags": ["Deliverables"],
        "summary": "Request presigned URL for large files",
        "description": "Returns a temporary AWS S3 presigned URL that allows direct file uploads up to 500MB without hitting the Vercel payload limit. After successfully uploading to the provided `url`, you must call `POST /deliverables` with the returned `key` and `product_id` to finalize the attachment.",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "filename": {
                                "type": "string",
                                "description": "The name of the file to be uploaded (e.g. big-video.mp4)"
                            },
                            "contentType": {
                                "type": "string",
                                "description": "The MIME type of the file (e.g. video/mp4). Defaults to application/octet-stream"
                            }
                        },
                        "required": ["filename"]
                    }
                }
            }
        },
        "responses": {
            "200": {
                "description": "Success",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "url": {
                                    "type": "string",
                                    "description": "The temporary URL to PUT your file to"
                                },
                                "key": {
                                    "type": "string",
                                    "description": "The file_key to use in the subsequent POST /deliverables call"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

data['paths']['/deliverables/presigned'] = new_presigned

# Update POST /deliverables to support application/json
post_deliverables = data['paths']['/deliverables']['post']
existing_desc = post_deliverables.get('description', '')
if "For large files" not in existing_desc:
    post_deliverables['description'] = existing_desc + "\n\nFor large files, first request a presigned URL from `/deliverables/presigned`, then call this endpoint using `application/json` with the returned `file_key`."

if 'requestBody' not in post_deliverables:
    post_deliverables['requestBody'] = {'content': {}}

post_deliverables['requestBody']['content']['application/json'] = {
    "schema": {
        "type": "object",
        "properties": {
            "product_id": {
                "type": "string"
            },
            "variant_id": {
                "type": "string"
            },
            "file_key": {
                "type": "string",
                "description": "The S3 key returned by the /deliverables/presigned endpoint."
            },
            "title": {
                "type": "string"
            },
            "description": {
                "type": "string"
            },
            "button_label": {
                "type": "string"
            },
            "file_name": {
                "type": "string"
            },
            "file_size": {
                "type": "number"
            }
        },
        "required": ["product_id", "file_key"]
    }
}

with open('api-reference/core-api.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Updated core-api.json successfully")
