import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  planId: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}

export class UpdateSubscriptionDto {
  @IsNumber()
  @IsOptional()
  planId?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}
