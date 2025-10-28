import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', // mock hashed password
    role: 'user',
    nombre: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockClientsService = {
    findByUserId: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return success false when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await authService.login({
        email: 'nonexistent@test.com',
        password: 'password',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return success true with token for valid hashed password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        nombre: mockUser.nombre,
      });
    });

    it('should support legacy plain text passwords', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: 'plaintext',
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.login({
        email: 'test@test.com',
        password: 'plaintext',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should return success false for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashed = await authService.hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[ab]\$/); // bcrypt hash pattern
    });
  });

  describe('validatePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await authService.validatePassword(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'password123';
      const hashed = await bcrypt.hash(password, 10);

      const result = await authService.validatePassword(
        'wrongpassword',
        hashed,
      );

      expect(result).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com' });

      const result = authService.validateToken('valid-token');

      expect(result).toBe(true);
    });

    it('should return false for invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.validateToken('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should return success true', () => {
      const result = authService.logout();

      expect(result.success).toBe(true);
    });
  });
});
