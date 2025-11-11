import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  billing_period?: string;

  @IsNumber()
  @IsOptional()
  max_catalogs?: number;

  @IsNumber()
  @IsOptional()
  max_products_per_catalog?: number;

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  billing_period?: string;

  @IsNumber()
  @IsOptional()
  max_catalogs?: number;

  @IsNumber()
  @IsOptional()
  max_products_per_catalog?: number;

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
