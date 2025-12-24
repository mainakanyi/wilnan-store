import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterOwnerDto {
  @IsString()
  @IsNotEmpty()
  tenantName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'tenantSlug must be lowercase letters, numbers, and hyphens only',
  })
  tenantSlug!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
