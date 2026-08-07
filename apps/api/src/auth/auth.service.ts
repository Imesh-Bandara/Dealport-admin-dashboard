import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // A precomputed bcrypt hash of an arbitrary, never-used password. When no
  // user matches, we still run a compare against this so the response time
  // for "no such user" and "wrong password" is the same shape of work —
  // otherwise the missing bcrypt.compare() on the not-found path is a timing
  // side-channel an attacker can use to enumerate valid emails.
  private static readonly DUMMY_HASH =
    '$2b$10$hOCMbkknn05sTNTcD7h5..6hQoIIgBjY2An1sGv5.triH8fH1aA8e';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? AuthService.DUMMY_HASH,
    );

    if (!user) {
      // Safe to log the email (not a secret); never log the password.
      this.logger.warn(`Login failed: no user found for email "${dto.email}"`);
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!passwordMatches) {
      this.logger.warn(`Login failed: wrong password for email "${dto.email}"`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
