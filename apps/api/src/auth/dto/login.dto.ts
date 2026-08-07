import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

function normalizeEmail({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254) // RFC 5321 max mailbox length — also bounds bcrypt/DB input size
  email: string;

  @IsString()
  @MinLength(6)
  // bcrypt silently ignores bytes past 72 — capping here rejects the request
  // instead of hashing megabytes of attacker-supplied input on every attempt.
  @MaxLength(72)
  password: string;
}
