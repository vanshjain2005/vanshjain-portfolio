const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Vansh Jain Cinematic Portfolio API',
    version: '1.0.0',
    description: 'RESTful API for Vansh Jain Portfolio — serving projects, handling contact inquiries, recording visitor analytics, and providing administrative CMS capabilities.',
    contact: {
      name: 'Vansh Jain',
      email: 'vanshjain.dev@gmail.com'
    }
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Project: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'RAKSHI\nCREATES' },
          slug: { type: 'string', example: 'rakshi-creates' },
          index_label: { type: 'string', example: '01 / 03' },
          description: { type: 'string', example: 'A website for Rakshi’s resin art, collections, and custom work.' },
          category: { type: 'string', example: 'RESIN ART / COLLECTIONS / CUSTOM' },
          meta_tags: { type: 'string', example: 'LIVE EXPERIENCE | RESIN ART / COLLECTIONS / CUSTOM' },
          live_url: { type: 'string', example: 'https://rakshi-creates.vercel.app/' },
          accent_color: { type: 'string', example: '#dfa874' },
          order_index: { type: 'integer', example: 1 },
          is_published: { type: 'integer', example: 1 }
        }
      },
      InquiryInput: {
        type: 'object',
        required: ['name', 'email', 'idea'],
        properties: {
          name: { type: 'string', example: 'Elon Musk' },
          email: { type: 'string', format: 'email', example: 'elon@x.com' },
          phone: { type: 'string', example: '+1 555-0199' },
          idea: { type: 'string', example: 'We need a high-end cinematic interactive 3D landing page for Starship.' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'vanshjain.dev@gmail.com' },
          password: { type: 'string', example: 'Admin@12345' }
        }
      }
    }
  },
  paths: {
    '/api/projects': {
      get: {
        summary: 'Get all published projects',
        tags: ['Projects'],
        responses: {
          200: {
            description: 'List of projects',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Project' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new project (Admin Only)',
        tags: ['Projects'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' }
            }
          }
        },
        responses: {
          201: { description: 'Project created' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/projects/{id}': {
      get: {
        summary: 'Get single project by ID or slug',
        tags: ['Projects'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Project details' },
          404: { description: 'Project not found' }
        }
      },
      put: {
        summary: 'Update an existing project (Admin Only)',
        tags: ['Projects'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' }
            }
          }
        },
        responses: {
          200: { description: 'Project updated' },
          404: { description: 'Project not found' }
        }
      },
      delete: {
        summary: 'Delete a project (Admin Only)',
        tags: ['Projects'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Project deleted' },
          404: { description: 'Project not found' }
        }
      }
    },
    '/api/inquiries': {
      get: {
        summary: 'List contact inquiries (Admin Only)',
        tags: ['Inquiries'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['new', 'read', 'replied', 'archived'] } }
        ],
        responses: {
          200: { description: 'List of inquiries' }
        }
      },
      post: {
        summary: 'Submit a new contact inquiry (Public, Rate Limited)',
        tags: ['Inquiries'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryInput' }
            }
          }
        },
        responses: {
          201: { description: 'Inquiry submitted successfully' },
          400: { description: 'Validation error' },
          429: { description: 'Too many requests' }
        }
      }
    },
    '/api/inquiries/{id}': {
      patch: {
        summary: 'Update inquiry status or note (Admin Only)',
        tags: ['Inquiries'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['new', 'read', 'replied', 'archived'] },
                  admin_note: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Inquiry updated' }
        }
      },
      delete: {
        summary: 'Delete inquiry (Admin Only)',
        tags: ['Inquiries'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Inquiry deleted' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Admin login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' }
            }
          }
        },
        responses: {
          200: { description: 'JWT Token generated' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get authenticated admin info',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current admin profile' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/analytics/track': {
      post: {
        summary: 'Track user interaction event',
        tags: ['Analytics'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_type'],
                properties: {
                  event_type: { type: 'string', example: 'pageview' },
                  target: { type: 'string', example: 'rakshi-creates' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Event tracked' }
        }
      }
    },
    '/api/analytics/summary': {
      get: {
        summary: 'Get site analytics summary (Admin Only)',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Analytics aggregate summary' }
        }
      }
    },
    '/api/settings': {
      get: {
        summary: 'Get site settings',
        tags: ['Settings'],
        responses: {
          200: { description: 'Site settings map' }
        }
      },
      put: {
        summary: 'Update site settings (Admin Only)',
        tags: ['Settings'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: { type: 'string' }
              }
            }
          }
        },
        responses: {
          200: { description: 'Settings updated' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
