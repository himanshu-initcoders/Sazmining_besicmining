import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request ${req.method} ${req.originalUrl}`);
    // console.log(`Request body:`, req.body);
    
    // Track response time
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`Response ${res.statusCode} - ${duration}ms`);
    });

    next();
  }
}
