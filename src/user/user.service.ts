import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ImageService,
  StorageLocation,
} from '../upload/services/image.service';
import { CartService } from '../cart/cart.service';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly imageService: ImageService,
    private readonly cartService: CartService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new AppException(
        `User not found`,
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
      );
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AppException(
        `User not found`,
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { email },
      );
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new AppException(
        `User not found`,
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        { username },
      );
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new AppException(
        'Email already in use',
        'EMAIL_ALREADY_EXISTS',
        HttpStatus.CONFLICT,
        { email: createUserDto.email },
      );
    }

    // Only check username if provided
    if (createUserDto.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUsername) {
        throw new AppException(
          'Username already in use',
          'USERNAME_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
          { username: createUserDto.username },
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      profileCompletion: this.calculateProfileCompletion(createUserDto),
    });

    // Save the user
    const savedUser = await this.userRepository.save(newUser);

    // Create a cart for the user
    await this.cartService.createCartForUser(savedUser.id);

    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new AppException(
          'Email already in use',
          'EMAIL_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
          { email: updateUserDto.email },
        );
      }
    }

    // Check if username is being updated and if it's already in use
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new AppException(
          'Username already in use',
          'USERNAME_ALREADY_EXISTS',
          HttpStatus.CONFLICT,
          { username: updateUserDto.username },
        );
      }
    }

    // Update password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user data
    const updatedUser = {
      ...user,
      ...updateUserDto,
      profileCompletion: this.calculateProfileCompletion({
        ...user,
        ...updateUserDto,
      }),
    };

    return this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async uploadProfilePhoto(
    userId: number,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findOne(userId);

    if (!file) {
      throw new AppException(
        'No file provided',
        'FILE_NOT_PROVIDED',
        HttpStatus.BAD_REQUEST,
        { userId },
      );
    }

    // Upload to Cloudinary
    const result = await this.imageService.uploadImage(file, {
      location: StorageLocation.CLOUDINARY,
      folder: 'user-profiles',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    // Update user with profile photo URL
    user.profilePhoto = result.url;

    // Recalculate profile completion
    user.profileCompletion = this.calculateProfileCompletion(user);

    return this.userRepository.save(user);
  }

  private calculateProfileCompletion(user: Partial<User>): number {
    const requiredFields = [
      'email',
      'termsAgreed',
    ];
    
    const optionalFields = [
      'username',
      'name',
      'phone',
      'profilePhoto',
    ];

    // Required fields contribute more to completion
    const requiredFieldsCount = requiredFields.filter((field) => !!user[field]).length;
    const optionalFieldsCount = optionalFields.filter((field) => !!user[field]).length;
    
    const totalWeight = requiredFields.length + optionalFields.length;
    const completedWeight = requiredFieldsCount + optionalFieldsCount;
    
    const completionPercentage = Math.floor(
      (completedWeight / totalWeight) * 100,
    );

    return completionPercentage;
  }
}
