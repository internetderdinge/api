import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();

// add Bearer JWT auth
export const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Bearer authentication',
});

export const xApiKey = registry.registerComponent('securitySchemes', 'x-api-key', {
  type: 'apiKey',
  in: 'header',
  name: 'x-api-key',
  description: 'API key for authentication',
});

/*
registry.registerComponent('global', 'wwww', [
  { name: 'ai', description: 'All AI-powered endpoints.' },
  { name: 'auth', description: 'Authentication and authorization.' },
  { name: 'Users', description: 'User management (create, read, update, delete).' },
  // add more as needed
]);

registry.registerComponent('tag', 'users', {
  name: 'users',
  description: 'Operations about users',
});
*/
