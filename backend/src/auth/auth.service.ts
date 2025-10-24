import { Injectable } from '@nestjs/common';
import { LoginDto, AuthResponse } from './auth.dto';

@Injectable()
export class AuthService {
  // Mock users database
  private users = [
    { email: 'admin@test.com', password: '123', role: 'admin' },
    { email: 'user@test.com', password: '123', role: 'user' },
  ];

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = this.users.find(
      u => u.email === loginDto.email && u.password === loginDto.password
    );

    if (user) {
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

  async logout(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async validateToken(token: string): Promise<boolean> {
    // Simple mock validation
    return Boolean(token && token.startsWith('mock-token-'));
  }
}
