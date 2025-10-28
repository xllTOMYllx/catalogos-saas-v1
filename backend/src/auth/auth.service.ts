import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponse } from './auth.dto';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
      };
    }

    try {
      // Hash password
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Create user with 'client' role
      const user = await this.usersService.create({
        email: registerDto.email,
        password: hashedPassword,
        nombre: registerDto.nombre,
        role: 'client',
      });

      // Create client (business) for this user
      const client = await this.clientsService.create({
        nombre: registerDto.businessName,
        userId: user.id,
        telefono: registerDto.telefono || '',
        logo: '/logosinfondo.png',
        color: '#f24427',
      });

      // Generate JWT token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          nombre: user.nombre,
        },
        client: {
          id: client.id,
          nombre: client.nombre,
          logo: client.logo,
          color: client.color,
          telefono: client.telefono,
        },
        message: 'Registration successful',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Registration failed: ' + errorMessage,
      };
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Check if password is hashed or plain text (for backward compatibility)
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Password is hashed, use bcrypt compare
      isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    } else {
      // Password is plain text (legacy), compare directly
      isValidPassword = user.password === loginDto.password;
    }

    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Get client info if user is a client
    let clientData:
      | {
          id: number;
          nombre: string;
          logo: string;
          color: string;
          telefono: string;
        }
      | undefined = undefined;
    if (user.role === 'client') {
      const clients = await this.clientsService.findByUserId(user.id);
      if (clients && clients.length > 0) {
        const client = clients[0]; // Get first client for this user
        clientData = {
          id: client.id,
          nombre: client.nombre,
          logo: client.logo,
          color: client.color,
          telefono: client.telefono,
        };
      }
    }

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
      },
      client: clientData,
    };
  }

  logout(): { success: boolean } {
    return { success: true };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  validateToken(token: string): boolean {
    try {
      this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
