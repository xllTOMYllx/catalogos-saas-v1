import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponse } from './auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
      },
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
