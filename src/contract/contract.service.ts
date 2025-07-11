import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../entities/contract.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';
import { CreateContractDto } from './dto/create-contract.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a contract for direct purchase (Buy Now)
   * @param createContractDto Contract data
   * @param buyerId Buyer user ID
   * @returns Created contract and updated product
   */
  async createContract(
    createContractDto: CreateContractDto,
    buyerId: number,
  ): Promise<{ contract: Contract; product: Product }> {
    // Verify buyer exists
    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new AppException(
        'User not found',
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { userId: buyerId },
      );
    }

    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createContractDto.productId },
      relations: ['user'],
    });

    if (!product) {
      throw new AppException(
        'Product not found',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId: createContractDto.productId },
      );
    }

    // Check if product is available for direct purchase
    if (product.disableBuyNow) {
      throw new AppException(
        'Product is not available for direct purchase',
        ErrorCodes.PRODUCT_NOT_AVAILABLE,
        HttpStatus.BAD_REQUEST,
        { productId: createContractDto.productId },
      );
    }

    // Check if product has active auctions (this would be handled by checking auction entities)
    // Note: Since auction logic is now separate, this check would need to query the Auction entity
    // For now, we'll rely on other availability checks

    // Check if product is published and active
    if (product.status !== 'Published' || !product.isActive) {
      throw new AppException(
        'Product is not available for purchase',
        ErrorCodes.PRODUCT_NOT_AVAILABLE,
        HttpStatus.BAD_REQUEST,
        { productId: createContractDto.productId },
      );
    }

    // Check if product is in stock
    if (product.availability === 'Out of Stock') {
      throw new AppException(
        'Product is out of stock',
        ErrorCodes.PRODUCT_OUT_OF_STOCK,
        HttpStatus.BAD_REQUEST,
        { productId: createContractDto.productId },
      );
    }

    // Check quantity for limited stock items
    if (product.stockType === 'limited' && product.quantity < 1) {
      throw new AppException(
        'Product is out of stock',
        ErrorCodes.PRODUCT_OUT_OF_STOCK,
        HttpStatus.BAD_REQUEST,
        { productId: createContractDto.productId },
      );
    }

    // Generate a unique contract ID
    const contractId = uuidv4();

    // Create contract
    const contract = new Contract();
    contract.contractId = contractId;
    contract.location = createContractDto.location;
    contract.depositPrice = createContractDto.depositPrice;
    contract.setupPrice = createContractDto.setupPrice || 0;
    contract.hostRate = createContractDto.hostRate;
    contract.salesTaxPercent = createContractDto.salesTaxPercent;
    contract.autoMaintenance = createContractDto.autoMaintenance || false;
    contract.buyerId = buyerId;
    contract.productId = createContractDto.productId;

    // Save contract
    const savedContract = await this.contractRepository.save(contract);

    // Update product with contract ID and reduce quantity if it's a limited stock item
    product.contractId = contractId;
    
    if (product.stockType === 'limited') {
      product.quantity -= 1;
      
      // Update availability if stock is depleted
      if (product.quantity === 0) {
        product.availability = 'Out of Stock';
      }
    }

    // Save updated product
    const updatedProduct = await this.productRepository.save(product);

    return { contract: savedContract, product: updatedProduct };
  }

  /**
   * Get a contract by ID
   * @param id Contract ID
   * @returns Contract
   */
  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['product', 'buyer'],
    });

    if (!contract) {
      throw new AppException(
        'Contract not found',
        ErrorCodes.CONTRACT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
      );
    }

    return contract;
  }

  /**
   * Find a contract by contract ID string
   * @param contractId Contract ID string
   * @returns Contract
   */
  async findByContractId(contractId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { contractId },
      relations: ['product', 'buyer'],
    });

    if (!contract) {
      throw new AppException(
        'Contract not found',
        ErrorCodes.CONTRACT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { contractId },
      );
    }

    return contract;
  }

  /**
   * Get all contracts
   * @returns List of contracts
   */
  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({
      relations: ['product', 'buyer'],
    });
  }

  /**
   * Get contracts by buyer ID
   * @param buyerId User ID of the buyer
   * @returns List of user's contracts
   */
  async findByBuyer(buyerId: number): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { buyerId },
      relations: ['product', 'buyer'],
    });
  }
} 