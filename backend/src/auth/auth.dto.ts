import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    role: string;
    nombre?: string;
  };
  message?: string;
}
