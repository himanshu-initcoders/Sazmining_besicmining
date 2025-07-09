import { JwtModuleOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecret =
  process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const jwtRefreshSecret =
  process.env.JWT_REFRESH_SECRET ||
  'your-refresh-secret-key-change-this-in-production';
const jwtExpiration = process.env.JWT_EXPIRATION || '15m';
const jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

export const jwtConfig: JwtModuleOptions = {
  secret: jwtSecret,
  signOptions: {
    expiresIn: jwtExpiration,
  },
};

export const jwtConstants = {
  secret: jwtSecret,
  refreshSecret: jwtRefreshSecret,
  expiresIn: jwtExpiration,
  refreshExpiresIn: jwtRefreshExpiration,
};
