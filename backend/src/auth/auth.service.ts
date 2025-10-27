import { Injectable } from '@nestjs/common';
import { LoginDto, AuthResponse } from './auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (user && user.password === loginDto.password) {
      return {
        success: true,
        token: 'mock-token-' + Date.now(),
        user: {
          email: user.email,
          role: user.role,
        },
      };
    }

    return {
      success: false,
      message: 'Invalid credentials',
    };
  }

  logout(): { success: boolean } {
    return { success: true };
  }

  validateToken(token: string): boolean {
    // Simple mock validation
    return Boolean(token && token.startsWith('mock-token-'));
  }
}
