import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';

// Mock de los servicios
jest.mock('../src/services/userService.js', () => ({
  default: {
    register: jest.fn(),
    login: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../src/services/productService.js', () => ({
  default: {
    getAll: jest.fn(),
    getFeatured: jest.fn(),
    getById: jest.fn(),
    getByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../src/services/categoryService.js', () => ({
  default: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../src/models/userModel.js', () => ({
  default: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

// Importar después de los mocks
const UserService = (await import('../src/services/userService.js')).default;
const ProductService = (await import('../src/services/productService.js')).default;
const CategoryService = (await import('../src/services/categoryService.js')).default;
const UserModel = (await import('../src/models/userModel.js')).default;

// Configurar entorno de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

const createToken = (payload = { id: 1, role: 'user' }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Backend E-commerce API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('GET /api/health should return ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ name: 'Test User' });

        expect(response.status).toBe(400);
      });

      it('should register a new user successfully', async () => {
        UserService.register.mockResolvedValue({
          token: 'mock-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }
        });

        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(201);
        expect(response.body.token).toBe('mock-token');
        expect(UserService.register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    describe('POST /api/auth/login', () => {
      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' });

        expect(response.status).toBe(400);
      });

      it('should login successfully with valid credentials', async () => {
        UserService.login.mockResolvedValue({
          token: 'mock-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }
        });

        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(200);
        expect(response.body.token).toBe('mock-token');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/auth/me');
        expect(response.status).toBe(401);
      });

      it('should return user info with valid token', async () => {
        const token = createToken({ id: 1, role: 'user' });
        UserModel.findById.mockResolvedValue({
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        });

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('test@example.com');
      });
    });
  });

  describe('Product Endpoints', () => {
    describe('GET /api/products', () => {
      it('should return list of products', async () => {
        ProductService.getAll.mockResolvedValue([
          { id: 1, name: 'Product 1', price: 100 },
          { id: 2, name: 'Product 2', price: 200 }
        ]);

        const response = await request(app).get('/api/products');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
      });
    });

    describe('GET /api/products/featured', () => {
      it('should return featured products', async () => {
        ProductService.getFeatured.mockResolvedValue([
          { id: 1, name: 'Featured Product', price: 100, featured: true }
        ]);

        const response = await request(app).get('/api/products/featured');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/products/:id', () => {
      it('should return product by id', async () => {
        ProductService.getById.mockResolvedValue({
          id: 1,
          name: 'Test Product',
          price: 100
        });

        const response = await request(app).get('/api/products/1');

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Test Product');
      });
    });

    describe('POST /api/products', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/products')
          .send({
            name: 'New Product',
            description: 'Description',
            price: 100,
            stock: 10
          });

        expect(response.status).toBe(401);
      });

      it('should create product with valid token', async () => {
        const token = createToken({ id: 1, role: 'user' });
        ProductService.create.mockResolvedValue({
          id: 1,
          name: 'New Product',
          price: 100,
          stock: 10
        });

        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'New Product',
            description: 'Description',
            price: 100,
            stock: 10
          });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe('New Product');
      });
    });

    describe('GET /api/products/my/list', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/products/my/list');
        expect(response.status).toBe(401);
      });

      it('should return user products with valid token', async () => {
        const token = createToken({ id: 1, role: 'user' });
        ProductService.getByUser.mockResolvedValue([
          { id: 1, name: 'My Product', user_id: 1 }
        ]);

        const response = await request(app)
          .get('/api/products/my/list')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Category Endpoints', () => {
    describe('GET /api/categories', () => {
      it('should return list of categories', async () => {
        CategoryService.getAll.mockResolvedValue([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Books' }
        ]);

        const response = await request(app).get('/api/categories');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
      });
    });
  });

  describe('Cart Endpoints', () => {
    describe('GET /api/cart', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/cart');
        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/cart', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/cart')
          .send({ product_id: 1, quantity: 2 });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');
      expect(response.status).toBe(404);
    });

    it('should handle service errors gracefully', async () => {
      ProductService.getById.mockRejectedValue(
        Object.assign(new Error('Producto no encontrado'), { status: 404 })
      );

      const response = await request(app).get('/api/products/999');
      expect(response.status).toBe(404);
    });
  });
});
