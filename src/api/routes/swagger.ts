import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

/**
 * Swagger UI route for interactive API documentation
 * 
 * Serves OpenAPI specification at /api-docs endpoint
 * Provides interactive interface to test API endpoints
 */

const swaggerRouter = Router();

// Load OpenAPI specification from project root
// In production Docker: /app/openapi.yaml
// In development: project_root/openapi.yaml
const openapiPath = path.join(__dirname, '..', '..', '..', '..', 'openapi.yaml');
const swaggerDocument = YAML.load(openapiPath);

// Configure Swagger UI options
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Lifespire API Documentation',
};

// Serve Swagger UI
swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(swaggerDocument, swaggerOptions));

export default swaggerRouter;
