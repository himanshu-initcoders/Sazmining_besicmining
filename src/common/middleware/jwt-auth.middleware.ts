import { Injectable, NestMiddleware, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../exceptions/app.exception';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppException('No token provided', 'NO_TOKEN_PROVIDED', HttpStatus.UNAUTHORIZED);
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ 
        where: { id: decoded.sub }
      });

      if (!user) {
        throw new AppException('User not found', 'USER_NOT_FOUND', HttpStatus.UNAUTHORIZED);
      }
     // TODO check status
      req['user'] = user; // Now includes staff data if user is a staff member
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppException('Token expired', 'TOKEN_EXPIRED', HttpStatus.UNAUTHORIZED);
      }
      throw new AppException('Invalid token', 'INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    }
  }
}