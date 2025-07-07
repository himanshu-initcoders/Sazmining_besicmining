import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '../config/jwt.config';
import { AppException } from 'src/common/exceptions/app.exception';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  private clearAuthCookies(response: Response) {
    response.clearCookie('refresh_token');
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string, response: Response) {
    const user = await this.validateUser(email, password);
    if (!user) {
      this.clearAuthCookies(response);
      throw new AppException('Invalid credentials', 'INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user,
    };
  }

  async refreshTokens(refreshToken: string, response: Response) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });

      // Find the token in the database
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, userId: payload.sub },
        relations: ['user'],
      });

      // Check if token exists and is not revoked
      if (!storedToken || storedToken.isRevoked) {
        this.clearAuthCookies(response);
        throw new AppException('Invalid refresh token', 'INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        // Revoke the token and clear cookies
        await this.revokeRefreshToken(storedToken.id);
        this.clearAuthCookies(response);
        throw new AppException('Refresh token expired', 'REFRESH_TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }

      // Generate new tokens
      const tokens = await this.getTokens(storedToken.user.id, storedToken.user.email);
      
      // Revoke the old token
      await this.revokeRefreshToken(storedToken.id);
      
      // Store the new refresh token
      await this.storeRefreshToken(storedToken.user.id, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      this.clearAuthCookies(response);
      throw new AppException('Invalid refresh token', 'INVALID_REFRESH_TOKEN', HttpStatus.UNAUTHORIZED);
    }
  }

  async logout(userId: number, refreshToken: string, response: Response) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, userId },
    });

    if (!token) {
      this.clearAuthCookies(response);
      throw new AppException('Token not found', 'TOKEN_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.revokeRefreshToken(token.id);
    this.clearAuthCookies(response);
    return { message: 'Logout successful' };
  }

  async revokeAllUserTokens(userId: number) {
    const tokens = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
    });

    for (const token of tokens) {
      await this.revokeRefreshToken(token.id);
    }
  }

  private async revokeRefreshToken(tokenId: string) {
    await this.refreshTokenRepository.update(tokenId, { isRevoked: true });
  }

  private async storeRefreshToken(userId: number, refreshToken: string) {
    // Calculate expiration date based on the refresh token expiration time
    const expiresIn = jwtConstants.refreshExpiresIn;
    let expirationMs = 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    
    if (typeof expiresIn === 'string') {
      if (expiresIn.endsWith('d')) {
        expirationMs = parseInt(expiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000;
      } else if (expiresIn.endsWith('h')) {
        expirationMs = parseInt(expiresIn.slice(0, -1)) * 60 * 60 * 1000;
      } else if (expiresIn.endsWith('m')) {
        expirationMs = parseInt(expiresIn.slice(0, -1)) * 60 * 1000;
      } else if (expiresIn.endsWith('s')) {
        expirationMs = parseInt(expiresIn.slice(0, -1)) * 1000;
      }
    } else if (typeof expiresIn === 'number') {
      expirationMs = expiresIn * 1000; // Convert seconds to milliseconds
    }

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expirationMs);

    // Create and save the refresh token
    const newRefreshToken = this.refreshTokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt
    });

    await this.refreshTokenRepository.save(newRefreshToken);
  }

  private async getTokens(userId: number, email: string) {
    // Fetch user to get role
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException('User not found', 'USER_NOT_FOUND', HttpStatus.UNAUTHORIZED);
    }
    if(user.isActive === false){
      throw new AppException('User is not active', 'USER_NOT_ACTIVE', HttpStatus.UNAUTHORIZED);
    }
    
    let payload: any = { email, sub: userId, role: user.role };
    
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}