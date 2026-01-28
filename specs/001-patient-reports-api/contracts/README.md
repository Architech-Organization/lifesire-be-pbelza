# API Contracts

This directory contains API contract specifications for the Patient Reports Backend API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0 specification
- `examples/` - Request/response examples for testing

## Generating Client SDKs

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i contracts/openapi.yaml \
  -g typescript-axios \
  -o client/typescript

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i contracts/openapi.yaml \
  -g python \
  -o client/python
```

## Testing with Swagger UI

```bash
# Serve Swagger UI locally
npx swagger-ui-watcher contracts/openapi.yaml
```

## Validation

```bash
# Validate OpenAPI spec
npx @apidevtools/swagger-cli validate contracts/openapi.yaml
```
