import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AppException } from 'src/common/exceptions/app.exception';
import { jwtConstants } from 'src/config/jwt.config';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signup(signupDto, response);

    // Set refresh token as HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refresh_token);

    // Return only access token and user info in response body
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
      response,
    );

    // Set refresh token as HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refresh_token);

    // Return only access token and user info in response body
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() request,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Get token from cookie or request body
    const refreshToken =
      request.cookies?.refresh_token || refreshTokenDto.refreshToken;

    if (!refreshToken) {
      throw new AppException(
        'Refresh token is required',
        'REFRESH_TOKEN_REQUIRED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.authService.refreshTokens(refreshToken, response);

    // Set new refresh token as HTTP-only cookie
    this.setRefreshTokenCookie(response, result.refresh_token);

    // Return only access token in response body
    return {
      access_token: result.access_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res({ passthrough: true }) response: Response) {
    if (!req.cookies?.refresh_token) {
      throw new AppException(
        'Refresh token is required',
        'REFRESH_TOKEN_REQUIRED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.authService.logout(
      req.user.id,
      req.cookies.refresh_token,
      response,
    );

    // Clear the refresh token cookie
    response.clearCookie('refresh_token');

    return result;
  }

  private setRefreshTokenCookie(response: Response, token: string) {
    // Calculate cookie expiration based on JWT refresh token expiration
    let maxAge = 7 * 24 * 60 * 60 * 1000; // Default: 7 days in milliseconds
    const refreshExpiry = jwtConstants.refreshExpiresIn;

    if (typeof refreshExpiry === 'string') {
      if (refreshExpiry.endsWith('d')) {
        maxAge = parseInt(refreshExpiry.slice(0, -1)) * 24 * 60 * 60 * 1000;
      } else if (refreshExpiry.endsWith('h')) {
        maxAge = parseInt(refreshExpiry.slice(0, -1)) * 60 * 60 * 1000;
      } else if (refreshExpiry.endsWith('m')) {
        maxAge = parseInt(refreshExpiry.slice(0, -1)) * 60 * 1000;
      } else if (refreshExpiry.endsWith('s')) {
        maxAge = parseInt(refreshExpiry.slice(0, -1)) * 1000;
      }
    } else if (typeof refreshExpiry === 'number') {
      maxAge = refreshExpiry * 1000; // Convert seconds to milliseconds
    }

    // Set the cookie
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'lax',
      maxAge: maxAge,
      path: '/',
    });
  }
}
