import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { PlatformType } from '@prisma/client';

export class CreateSiteDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsEnum(PlatformType)
  platform!: PlatformType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
