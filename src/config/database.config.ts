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

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'besicmining',
  entities: [User, Product , Auction , Bid , Cart , CartItem , Contract , RefreshToken],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrations: [join(__dirname, '../database/migrations/*.{ts,js}')]
};

export const databaseConfig: TypeOrmModuleOptions = options;
const dataSource = new DataSource(options as DataSourceOptions & SeederOptions);

export default dataSource;