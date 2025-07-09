import { DataSource } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Seeder } from 'typeorm-extension';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    console.log('👤 Starting UserSeeder...');
    const userRepository = dataSource.getRepository(User);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!existingAdmin) {
      console.log('🔨 Creating admin user...');
      const adminUser = userRepository.create({
        email: 'admin@besicmining.com',
        username: 'admin',
        name: 'Admin User',
        role: UserRole.ADMIN,
        termsAgreed: true,
        password: await bcrypt.hash('Admin@123', 10),
        profileCompletion: 100,
      });
      await userRepository.save(adminUser);
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists, skipping...');
    }
  }
}
