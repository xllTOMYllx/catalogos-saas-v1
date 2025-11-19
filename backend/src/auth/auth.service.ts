import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetTokenDto,
} from './auth.dto';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { PasswordResetToken } from './password-reset-token.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
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

  async getProfile(userId: number): Promise<AuthResponse> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
      },
      client: clientData,
    };
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

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Clean up old/expired tokens for this user
    await this.resetTokenRepository.delete({
      userId: user.id,
    });

    // Save the hashed token to database
    await this.resetTokenRepository.save({
      token: hashedToken,
      userId: user.id,
      expiresAt,
      used: false,
    });

    // Send email with reset link (using the unhashed token)
    const emailSent = await this.emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.nombre || 'Usuario',
    );

    if (!emailSent) {
      return {
        success: false,
        message: 'Failed to send reset email. Please try again later.',
      };
    }

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async verifyResetToken(
    verifyResetTokenDto: VerifyResetTokenDto,
  ): Promise<{ success: boolean; message: string }> {
    const { token } = verifyResetTokenDto;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the token in database
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      return {
        success: false,
        message: 'Invalid or expired reset token.',
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return {
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      };
    }

    // Check if token has been used
    if (resetToken.used) {
      return {
        success: false,
        message: 'This reset token has already been used.',
      };
    }

    return {
      success: true,
      message: 'Token is valid.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Hash the token to find in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find and validate the token
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token: hashedToken },
      relations: ['user'],
    });

    if (!resetToken) {
      return {
        success: false,
        message: 'Invalid or expired reset token.',
      };
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return {
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      };
    }

    // Check if token has been used
    if (resetToken.used) {
      return {
        success: false,
        message: 'This reset token has already been used.',
      };
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user's password
    await this.usersService.updatePassword(resetToken.userId, hashedPassword);

    // Mark token as used
    resetToken.used = true;
    await this.resetTokenRepository.save(resetToken);

    // Clean up old tokens for this user
    await this.resetTokenRepository.delete({
      userId: resetToken.userId,
      id: LessThan(resetToken.id),
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  // Clean up expired tokens (should be run periodically)
  async cleanupExpiredTokens(): Promise<void> {
    await this.resetTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
