import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Contract } from '../entities/contract.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

dotenv.config();

// Direct check of NODE_ENV for clearer debugging
console.log(`🔍 NODE_ENV directly from process.env: "${process.env.NODE_ENV}"`);

// Check for various production environment indicators
const isProduction = 
  process.env.NODE_ENV === 'production' || 
  process.env.NODE_ENV === 'prod' || 
  process.env.ENV === 'production' || 
  process.env.ENV === 'prod' ||
  process.env.ENVIRONMENT === 'production' || 
  process.env.ENVIRONMENT === 'prod';

const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

console.log(`🔌 Database initializing in ${environment} mode`);
console.log(`📊 Environment variables detected:
  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}
  - ENV: ${process.env.ENV || 'not set'}
  - ENVIRONMENT: ${process.env.ENVIRONMENT || 'not set'}
  - DATABASE_URL: ${process.env.DATABASE_URL ? 'set (value hidden)' : 'not set'}`);

// Base configuration with entities and common settings
const baseConfig = {
  entities: [
    User,
    Product,
    Auction,
    Bid,
    Cart,
    CartItem,
    Contract,
    RefreshToken,
  ],
  synchronize: !isProduction,
  logging: !isProduction,
  migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
  ssl: isProduction ? {
    rejectUnauthorized: false, // Required for Heroku Postgres
  } : false,
};

// Determine connection options based on environment
let connectionOptions: DataSourceOptions;

if (isProduction && process.env.DATABASE_URL) {
  // Use connection URL for production (Heroku, Railway, etc.)
  connectionOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ...baseConfig,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
  console.log('📦 Using DATABASE_URL for connection in PRODUCTION mode');
} else {
  // Use individual connection parameters
  connectionOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'besicmining',
    ...baseConfig,
  };
  
  if (isProduction) {
    console.log('⚠️ Running in PRODUCTION mode but using individual connection parameters (DATABASE_URL not found)');
  }
  
  console.log(`📦 Database connection details:
    - Host: ${connectionOptions.host}
    - Port: ${connectionOptions.port}
    - Database: ${connectionOptions.database}
    - Username: ${connectionOptions.username}
    - SSL: ${connectionOptions.ssl ? 'Enabled' : 'Disabled'}
    - Synchronize: ${connectionOptions.synchronize ? 'Enabled' : 'Disabled'}`);
}

const options: DataSourceOptions & SeederOptions = connectionOptions as DataSourceOptions & SeederOptions;

export const databaseConfig: TypeOrmModuleOptions = {
  ...options,
  // Add event listeners for connection status
  autoLoadEntities: true,
};

const dataSource = new DataSource(options);

// Log connection status when the app starts
dataSource.initialize()
  .then(() => {
    console.log('✅ Database connection established successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed', error);
  });

export default dataSource;