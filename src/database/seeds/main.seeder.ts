import { DataSource } from 'typeorm';
import { Seeder, runSeeder } from 'typeorm-extension';
import { Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { ProductSeeder } from './product.seeder';

export class MainSeeder implements Seeder {
  private readonly logger = new Logger('MainSeeder');

  public async run(dataSource: DataSource): Promise<void> {
    console.log('🌱 Starting MainSeeder...');
    this.logger.log('Running all seeders...');

    try {
      console.log('🏃 Running UserSeeder...');
      await runSeeder(dataSource, UserSeeder);
      console.log('✅ UserSeeder completed');

      console.log('🏃 Running ProductSeeder...');
      await runSeeder(dataSource, ProductSeeder);
      console.log('✅ ProductSeeder completed');

      console.log('🎉 All seeders completed successfully');
      this.logger.log('All seeders completed successfully');
    } catch (error) {
      console.error('❌ Error in MainSeeder:', error);
      this.logger.error('Error in MainSeeder:', error.stack);
      throw error;
    }
  }
}
