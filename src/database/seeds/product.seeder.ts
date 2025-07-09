import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Product, ProductStatus, PublishStatus, AvailabilityStatus, AuctionType, CoolingType, ProductType, StockType } from '../../entities/product.entity';

export class ProductSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    console.log('🛒 Starting ProductSeeder...');
    const productRepository = dataSource.getRepository(Product);
    
    // Check if products already exist
    const productsExist = await productRepository.find();
    
    if (productsExist.length === 0) {
      console.log('🔨 Creating sample products...');
        // Sample mining products
        const products: Partial<Product>[] = [
          {
            serialNumber: 'ANT-S19P-001',
            modelName: 'Antminer S19 Pro',
            description: 'High-performance Bitcoin mining ASIC with 110 TH/s hashrate and 3250W power consumption.',
            imageUrl: 'https://backend.basicmining.com/api/getFileAccess/product_image-wq8w8op-1741203430544.png',
            askPrice: 2499.99,
            hashRate: 110,
            power: 3250,
            efficiency: 29.5,
            manufacturer: 'Bitmain',
            isActive: true,
            productStatus: ProductStatus.ONLINE,
            availability: AvailabilityStatus.IN_STOCK,
            auctionType: AuctionType.FIXED,
            cooling: CoolingType.AIR,
            type: ProductType.MARKETPLACE,
            status: PublishStatus.PUBLISHED,
            stockType: StockType.LIMITED,
            userId: '1',
            disableBuyNow: false,
            hosting: false
          },
          {
            serialNumber: 'WM-M30S-002',
            modelName: 'Whatsminer M30S++',
            description: 'Bitcoin miner with 112 TH/s hashrate and 3472W power consumption.',
            imageUrl: 'https://backend.basicmining.com/api/getFileAccess/product_image-wq8w8op-1741203430544.png',
            askPrice: 2399.99,
            hashRate: 112,
            power: 3472,
            efficiency: 31,
            manufacturer: 'MicroBT',
            isActive: true,
            productStatus: ProductStatus.ONLINE,
            availability: AvailabilityStatus.IN_STOCK,
            auctionType: AuctionType.FIXED,
            cooling: CoolingType.AIR,
            type: ProductType.MARKETPLACE,
            status: PublishStatus.PUBLISHED,
            stockType: StockType.LIMITED,
            userId: '1',
            disableBuyNow: false,
            hosting: false
          },
          {
            serialNumber: 'AVA-A1246-003',
            modelName: 'Avalon A1246',
            description: 'Bitcoin mining hardware with 90 TH/s hashrate and 3420W power consumption.',
            imageUrl: 'https://backend.basicmining.com/api/getFileAccess/product_image-wq8w8op-1741203430544.png',
            askPrice: 1899.99,
            hashRate: 90,
            power: 3420,
            efficiency: 38,
            manufacturer: 'Canaan',
            isActive: true,
            productStatus: ProductStatus.ONLINE,
            availability: AvailabilityStatus.IN_STOCK,
            auctionType: AuctionType.FIXED,
            cooling: CoolingType.AIR,
            type: ProductType.MARKETPLACE,
            status: PublishStatus.PUBLISHED,
            stockType: StockType.LIMITED,
            userId: '1',
            disableBuyNow: false,
            hosting: false
          },
          {
            serialNumber: 'INN-A11-004',
            modelName: 'Innosilicon A11 Pro ETH',
            description: 'Ethereum miner with 2000 MH/s hashrate and 2500W power consumption.',
            imageUrl: 'https://backend.basicmining.com/api/getFileAccess/product_image-wq8w8op-1741203430544.png',
            askPrice: 3499.99,
            hashRate: 2000,
            power: 2500,
            efficiency: 1.25,
            manufacturer: 'Innosilicon',
            isActive: true,
            productStatus: ProductStatus.ONLINE,
            availability: AvailabilityStatus.IN_STOCK,
            auctionType: AuctionType.FIXED,
            cooling: CoolingType.AIR,
            type: ProductType.MARKETPLACE,
            status: PublishStatus.PUBLISHED,
            stockType: StockType.LIMITED,
            userId: '1',
            disableBuyNow: false,
            hosting: false
          },
          {
            serialNumber: 'BIT-L7-005',
            modelName: 'Bitmain Antminer L7',
            description: 'Scrypt miner for Litecoin and Dogecoin with 9.5 GH/s hashrate and 3425W power consumption.',
            imageUrl: 'https://backend.basicmining.com/api/getFileAccess/product_image-wq8w8op-1741203430544.png',
            askPrice: 3999.99,
            hashRate: 9500,
            power: 3425,
            efficiency: 0.36,
            manufacturer: 'Bitmain',
            isActive: true,
            productStatus: ProductStatus.ONLINE,
            availability: AvailabilityStatus.IN_STOCK,
            auctionType: AuctionType.FIXED,
            cooling: CoolingType.AIR,
            type: ProductType.MARKETPLACE,
            status: PublishStatus.PUBLISHED,
            stockType: StockType.LIMITED,
            userId: '1',
            disableBuyNow: false,
            hosting: false
          }
        ];
        
        // Create products with repository
        const createdProducts = productRepository.create(products);
        await productRepository.save(createdProducts);
        console.log(`✅ Created ${createdProducts.length} products successfully`);
    } else {
      console.log('ℹ️ Products already exist, skipping...');
    }
  }
} 