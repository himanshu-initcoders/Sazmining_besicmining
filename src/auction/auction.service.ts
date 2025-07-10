import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Auction, AuctionStatus } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Product, AuctionType } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new auction
   * @param createAuctionDto Auction data
   * @param userId User ID creating the auction
   * @returns Created auction
   */
  async createAuction(
    createAuctionDto: CreateAuctionDto,
    userId: number,
  ): Promise<Auction> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        'User not found',
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { userId },
      );
    }

    // Verify product exists and belongs to user or user has purchased it
    const product = await this.productRepository.findOne({
      where: { id: createAuctionDto.productId },
    });

    if (!product) {
      throw new AppException(
        'Product not found',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId: createAuctionDto.productId },
      );
    }

    // Check if this is a reselling scenario with a valid contract
    let isReselling = false;
    if (createAuctionDto.contractId) {
      // Validate the contract exists and belongs to this user
      const contract = await this.getContractByIdAndVerifyOwner(
        createAuctionDto.contractId, 
        userId.toString()
      );
      
      // Verify the contract is for this product
      if (contract.productId !== createAuctionDto.productId.toString()) {
        throw new AppException(
          'Contract does not match the specified product',
          ErrorCodes.INVALID_CONTRACT_PRODUCT,
          HttpStatus.BAD_REQUEST,
          { 
            contractId: createAuctionDto.contractId, 
            contractProductId: contract.productId,
            specifiedProductId: createAuctionDto.productId 
          },
        );
      }
      
      isReselling = true;
    } else {
      // Not reselling, so check if product belongs to the user
      if (product.userId !== userId.toString()) {
        throw new AppException(
          'You do not have permission to auction this product',
          ErrorCodes.INSUFFICIENT_PERMISSIONS,
          HttpStatus.FORBIDDEN,
          { productId: createAuctionDto.productId, userId },
        );
      }
    }

    // Check if product is already in auction
    const existingAuction = await this.auctionRepository.findOne({
      where: { productId: createAuctionDto.productId.toString(), auctionStatus: AuctionStatus.ACTIVE },
    });

    if (existingAuction) {
      throw new AppException(
        'Product is already in an active auction',
        ErrorCodes.PRODUCT_ALREADY_IN_AUCTION,
        HttpStatus.CONFLICT,
        { productId: createAuctionDto.productId },
      );
    }

    // If not reselling, verify other product settings
    if (!isReselling) {
      // Verify product is set to auction type
      if (product.auctionType !== AuctionType.BID) {
        throw new AppException(
          'Product is not set for auction',
          ErrorCodes.PRODUCT_NOT_AUCTION_TYPE,
          HttpStatus.BAD_REQUEST,
          { productId: createAuctionDto.productId, auctionType: product.auctionType },
        );
      }

      // Verify auction dates are set
      if (!product.auctionStartDate || !product.auctionEndDate) {
        throw new AppException(
          'Product auction dates are not set',
          ErrorCodes.INVALID_AUCTION_DATES,
          HttpStatus.BAD_REQUEST,
          { productId: createAuctionDto.productId },
        );
      }
    }

    // Create auction
    const auction = new Auction();
    auction.productId = createAuctionDto.productId.toString();
    auction.publisherId = userId.toString();
    auction.productPrice = createAuctionDto.productPrice;
    auction.auctionStatus = createAuctionDto.auctionStatus || AuctionStatus.ACTIVE;

    // Save auction
    const savedAuction = await this.auctionRepository.save(auction);

    // Update product to reflect it's in auction
    product.auctionType = AuctionType.BID;
    await this.productRepository.save(product);

    return savedAuction;
  }

  /**
   * Place a bid on an auction
   * @param placeBidDto Bid data
   * @param userId User ID placing the bid
   * @returns Created bid
   */
  async placeBid(placeBidDto: PlaceBidDto, userId: number): Promise<Bid> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        'User not found',
        ErrorCodes.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { userId },
      );
    }

    // Verify auction exists and is active
    const auction = await this.auctionRepository.findOne({
      where: { id: placeBidDto.auctionId },
      relations: ['product'],
    });

    if (!auction) {
      throw new AppException(
        'Auction not found',
        ErrorCodes.AUCTION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { auctionId: placeBidDto.auctionId },
      );
    }

    // Check if auction is active
    if (auction.auctionStatus !== AuctionStatus.ACTIVE) {
      throw new AppException(
        `Auction is not active. Current status: ${auction.auctionStatus}`,
        ErrorCodes.AUCTION_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
        { auctionId: placeBidDto.auctionId, status: auction.auctionStatus },
      );
    }

    // Get the product associated with the auction
    const product = await this.productRepository.findOne({
      where: { id: parseInt(auction.productId) },
    });

    if (!product) {
      throw new AppException(
        'Product not found',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId: auction.productId },
      );
    }

    // Check if auction period is valid
    const now = new Date();
    if (now < product.auctionStartDate) {
      throw new AppException(
        'Auction has not started yet',
        ErrorCodes.AUCTION_NOT_STARTED,
        HttpStatus.BAD_REQUEST,
        { 
          auctionId: placeBidDto.auctionId, 
          startDate: product.auctionStartDate,
          currentDate: now 
        },
      );
    }

    if (now > product.auctionEndDate) {
      throw new AppException(
        'Auction has already ended',
        ErrorCodes.AUCTION_ENDED,
        HttpStatus.BAD_REQUEST,
        { 
          auctionId: placeBidDto.auctionId, 
          endDate: product.auctionEndDate,
          currentDate: now 
        },
      );
    }

    // Check if user is the owner of the auction/product
    if (auction.publisherId === userId.toString()) {
      throw new AppException(
        'You cannot bid on your own auction',
        ErrorCodes.CANNOT_BID_OWN_AUCTION,
        HttpStatus.BAD_REQUEST,
        { auctionId: placeBidDto.auctionId, userId },
      );
    }

    // Find highest bid
    const highestBid = await this.bidRepository.findOne({
      where: { auctionId: placeBidDto.auctionId.toString() },
      order: { bidPrice: 'DESC' },
    });

    // Check if bid is higher than the highest bid or starting price
    const minRequiredBid = highestBid 
      ? highestBid.bidPrice * 1.01 // At least 1% higher than the highest bid
      : auction.productPrice;

    if (placeBidDto.bidPrice < minRequiredBid) {
      throw new AppException(
        `Bid must be at least ${minRequiredBid.toFixed(2)}`,
        ErrorCodes.BID_TOO_LOW,
        HttpStatus.BAD_REQUEST,
        { 
          auctionId: placeBidDto.auctionId, 
          bidPrice: placeBidDto.bidPrice,
          minRequiredBid: minRequiredBid 
        },
      );
    }

    // Create bid
    const bid = new Bid();
    bid.auctionId = placeBidDto.auctionId.toString();
    bid.bidUserId = userId.toString();
    bid.bidPrice = placeBidDto.bidPrice;

    // Save bid
    const savedBid = await this.bidRepository.save(bid);

    // Update auction with highest bidder
    auction.bidderId = userId.toString();
    await this.auctionRepository.save(auction);

    return savedBid;
  }

  /**
   * Get an auction by ID
   * @param id Auction ID
   * @returns Auction
   */
  async findOne(id: number): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['product', 'bidder', 'publisher', 'bids', 'bids.bidUser'],
    });

    if (!auction) {
      throw new AppException(
        'Auction not found',
        ErrorCodes.AUCTION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { id },
      );
    }

    return auction;
  }

  /**
   * Get all auctions with filtering
   * @param status Optional status filter
   * @returns List of auctions
   */
  async findAll(status?: string): Promise<Auction[]> {
    const query: any = {};
    if (status) {
      query.auctionStatus = status;
    }

    return this.auctionRepository.find({
      where: query,
      relations: ['product', 'bidder', 'publisher'],
    });
  }

  /**
   * Get auctions by user (as publisher)
   * @param userId User ID
   * @param status Optional status filter
   * @returns List of user's auctions
   */
  async findByUser(userId: number, status?: string): Promise<Auction[]> {
    const query: any = { publisherId: userId.toString() };
    if (status) {
      query.auctionStatus = status;
    }

    return this.auctionRepository.find({
      where: query,
      relations: ['product', 'bidder', 'publisher'],
    });
  }

  /**
   * Get auctions where user has placed bids
   * @param userId User ID
   * @returns List of auctions user has bid on
   */
  async findUserBids(userId: number): Promise<Auction[]> {
    // Find all bids by the user
    const userBids = await this.bidRepository.find({
      where: { bidUserId: userId.toString() },
      relations: ['auction'],
    });

    // Extract unique auction IDs
    const auctionIds = [...new Set(userBids.map(bid => bid.auctionId))];
    
    // Get all those auctions
    const auctions = await this.auctionRepository.find({
      where: auctionIds.map(id => ({ id: parseInt(id) })),
      relations: ['product', 'bidder', 'publisher'],
    });

    return auctions;
  }

  /**
   * End an auction
   * @param id Auction ID
   * @param userId User ID requesting the end (must be the publisher)
   * @returns Updated auction
   */
  async endAuction(id: number, userId: number): Promise<Auction> {
    const auction = await this.findOne(id);

    // Check if user is the publisher
    if (auction.publisherId !== userId.toString()) {
      throw new AppException(
        'You do not have permission to end this auction',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { auctionId: id, userId },
      );
    }

    // Check if auction is active
    if (auction.auctionStatus !== AuctionStatus.ACTIVE) {
      throw new AppException(
        `Auction is already ${auction.auctionStatus}`,
        ErrorCodes.AUCTION_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
        { auctionId: id, status: auction.auctionStatus },
      );
    }

    // Update auction status
    auction.auctionStatus = AuctionStatus.COMPLETED;
    return this.auctionRepository.save(auction);
  }

  /**
   * Cancel an auction
   * @param id Auction ID
   * @param userId User ID requesting the cancellation (must be the publisher)
   * @returns Updated auction
   */
  async cancelAuction(id: number, userId: number): Promise<Auction> {
    const auction = await this.findOne(id);

    // Check if user is the publisher
    if (auction.publisherId !== userId.toString()) {
      throw new AppException(
        'You do not have permission to cancel this auction',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { auctionId: id, userId },
      );
    }

    // Check if auction is active
    if (auction.auctionStatus !== AuctionStatus.ACTIVE) {
      throw new AppException(
        `Auction is already ${auction.auctionStatus}`,
        ErrorCodes.AUCTION_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
        { auctionId: id, status: auction.auctionStatus },
      );
    }

    // Check if there are bids
    if (auction.bids && auction.bids.length > 0) {
      throw new AppException(
        'Cannot cancel an auction with existing bids',
        ErrorCodes.AUCTION_HAS_BIDS,
        HttpStatus.BAD_REQUEST,
        { auctionId: id, bidCount: auction.bids.length },
      );
    }

    // Update auction status
    auction.auctionStatus = AuctionStatus.CANCELLED;
    return this.auctionRepository.save(auction);
  }

  /**
   * Process completed auctions (to be run by a scheduled task)
   * Updates status of auctions that have reached their end date
   */
  async processCompletedAuctions(): Promise<void> {
    // Find products with auctions that have passed their end date
    const products = await this.productRepository.find({
      where: {
        auctionEndDate: LessThan(new Date()),
        auctionType: AuctionType.BID,
      },
    });

    for (const product of products) {
      // Find active auctions for this product
      const auctions = await this.auctionRepository.find({
        where: {
          productId: product.id.toString(),
          auctionStatus: AuctionStatus.ACTIVE,
        },
        relations: ['bids'],
      });

      for (const auction of auctions) {
        // Mark auction as completed
        auction.auctionStatus = AuctionStatus.COMPLETED;
        await this.auctionRepository.save(auction);

        // If there's a winning bidder, we could trigger contract creation here
      }
    }
  }

  /**
   * Helper method to get a contract by ID and verify it belongs to the user
   * @param contractId Contract ID
   * @param userId User ID
   * @returns Contract if valid
   */
  private async getContractByIdAndVerifyOwner(
    contractId: string, 
    userId: string
  ): Promise<any> {
    // We would normally import ContractService here, but to avoid circular dependencies,
    // we'll just make a direct query to the database
    const connection = this.auctionRepository.manager.connection;
    const contractRepo = connection.getRepository('Contract');
    
    const contract = await contractRepo.findOne({
      where: { contractId },
    });
    
    if (!contract) {
      throw new AppException(
        'Contract not found',
        ErrorCodes.CONTRACT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { contractId },
      );
    }
    
    // Verify the contract belongs to this user
    if (contract.buyerId !== userId) {
      throw new AppException(
        'You do not have permission to auction this contract',
        ErrorCodes.INSUFFICIENT_PERMISSIONS,
        HttpStatus.FORBIDDEN,
        { contractId, userId },
      );
    }
    
    return contract;
  }
} 