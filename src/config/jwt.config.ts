export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'supersecretkey',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}; 