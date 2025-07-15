import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Auction, AuctionStatus } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Contract } from '../entities/contract.entity';
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
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
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
      relations: ['auctions'],
    });

    if (!product) {
      throw new AppException(
        'Product not found',
        ErrorCodes.PRODUCT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        { productId: createAuctionDto.productId },
      );
    }

    // Validate auction dates
    const now = new Date();
    if (createAuctionDto.startDate < now) {
      throw new AppException(
        'Auction start date cannot be in the past',
        ErrorCodes.INVALID_AUCTION_DATES,
        HttpStatus.BAD_REQUEST,
        { startDate: createAuctionDto.startDate, currentDate: now },
      );
    }

    if (createAuctionDto.endDate <= createAuctionDto.startDate) {
      throw new AppException(
        'Auction end date must be after start date',
        ErrorCodes.INVALID_AUCTION_DATES,
        HttpStatus.BAD_REQUEST,
        { startDate: createAuctionDto.startDate, endDate: createAuctionDto.endDate },
      );
    }

    // Check if this is a reselling scenario with a valid contract
    let isReselling = false;
    if (createAuctionDto.contractId) {
      // Validate the contract exists and belongs to this user
      const contract = await this.getContractByIdAndVerifyOwner(
        createAuctionDto.contractId,
        userId,
      );

      // Verify the contract is for this product
      // Robust comparison handling both string and number types
      const contractProductId = Number(contract.productId);
      const dtoProductId = Number(createAuctionDto.productId);

      if (isNaN(contractProductId) || isNaN(dtoProductId)) {
        throw new AppException(
          'Invalid product ID format',
          ErrorCodes.INVALID_PARAMETER,
          HttpStatus.BAD_REQUEST,
          {
            contractId: createAuctionDto.contractId,
            contractProductId: contract.productId,
            specifiedProductId: createAuctionDto.productId,
          },
        );
      }

      if (contractProductId !== dtoProductId) {
        throw new AppException(
          'Contract does not match the specified product',
          ErrorCodes.INVALID_CONTRACT_PRODUCT,
          HttpStatus.BAD_REQUEST,
          {
            contractId: createAuctionDto.contractId,
            contractProductId: contractProductId,
            specifiedProductId: dtoProductId,
            originalContractProductId: contract.productId,
            originalSpecifiedProductId: createAuctionDto.productId,
          },
        );
      }

      isReselling = true;
    } else {
      // Not reselling, so check if product belongs to the user
      if (product.userId !== userId) {
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
      where: {
        productId: createAuctionDto.productId,
        auctionStatus: AuctionStatus.ACTIVE,
      },
    });

    if (existingAuction) {
      throw new AppException(
        'Product is already in an active auction',
        ErrorCodes.PRODUCT_ALREADY_IN_AUCTION,
        HttpStatus.CONFLICT,
        { productId: createAuctionDto.productId },
      );
    }

    // Create auction
    const auction = new Auction();
    auction.productId = createAuctionDto.productId;
    auction.publisherId = userId;
    auction.startingPrice = createAuctionDto.startingPrice;
    auction.startDate = createAuctionDto.startDate;
    auction.endDate = createAuctionDto.endDate;
    auction.auctionStatus =
      createAuctionDto.auctionStatus || AuctionStatus.ACTIVE;

    // Save auction
    const savedAuction = await this.auctionRepository.save(auction);

    // Note: Product entity no longer tracks auction type - this is handled by separate Auction entities

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
      relations: ['product', 'product.user'],
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

    // Check if auction period is valid (using auction dates, not product dates)
    const now = new Date();
    if (now < auction.startDate) {
      throw new AppException(
        'Auction has not started yet',
        ErrorCodes.AUCTION_NOT_STARTED,
        HttpStatus.BAD_REQUEST,
        {
          auctionId: placeBidDto.auctionId,
          startDate: auction.startDate,
          currentDate: now,
        },
      );
    }

    if (now > auction.endDate) {
      throw new AppException(
        'Auction has already ended',
        ErrorCodes.AUCTION_ENDED,
        HttpStatus.BAD_REQUEST,
        {
          auctionId: placeBidDto.auctionId,
          endDate: auction.endDate,
          currentDate: now,
        },
      );
    }

    // Check if user is the owner of the auction/product
    if (auction.publisherId === userId) {
      throw new AppException(
        'You cannot bid on your own auction',
        ErrorCodes.CANNOT_BID_OWN_AUCTION,
        HttpStatus.BAD_REQUEST,
        { auctionId: placeBidDto.auctionId, userId },
      );
    }

    // Find highest bid
    const highestBid = await this.bidRepository.findOne({
      where: { auctionId: placeBidDto.auctionId },
      order: { bidPrice: 'DESC' },
    });

    // Check if bid is higher than the highest bid or starting price
    const minRequiredBid = highestBid
      ? highestBid.bidPrice * 1.01 // At least 1% higher than the highest bid
      : auction.startingPrice;

    if (placeBidDto.bidPrice < minRequiredBid) {
      throw new AppException(
        `Bid must be at least ${minRequiredBid.toFixed(2)}`,
        ErrorCodes.BID_TOO_LOW,
        HttpStatus.BAD_REQUEST,
        {
          auctionId: placeBidDto.auctionId,
          bidPrice: placeBidDto.bidPrice,
          minRequiredBid: minRequiredBid,
        },
      );
    }

    // Create bid
    const bid = new Bid();
    bid.auctionId = placeBidDto.auctionId;
    bid.bidUserId = userId;
    bid.bidPrice = placeBidDto.bidPrice;

    // Save bid
    const savedBid = await this.bidRepository.save(bid);

    // Update auction with highest bidder
    auction.bidderId = userId;
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
      relations: ['product', 'product.user', 'bidder', 'publisher', 'bids', 'bids.bidUser'],
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
      relations: ['product', 'product.user', 'bidder', 'publisher'],
    });
  }

  /**
   * Get auctions by user (as publisher)
   * @param userId User ID
   * @param status Optional status filter
   * @returns List of user's auctions
   */
  async findByUser(userId: number, status?: string): Promise<Auction[]> {
    const query: any = { publisherId: userId };
    if (status) {
      query.auctionStatus = status;
    }

    return this.auctionRepository.find({
      where: query,
      relations: ['product', 'product.user', 'bidder', 'publisher'],
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
      where: { bidUserId: userId },
      relations: ['auction'],
    });

    // Extract unique auction IDs
    const auctionIds = [...new Set(userBids.map((bid) => bid.auctionId))];

    // Get all those auctions
    const auctions = await this.auctionRepository.find({
      where: auctionIds.map((id) => ({ id })),
      relations: ['product', 'product.user', 'bidder', 'publisher'],
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
    if (auction.publisherId !== userId) {
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
    if (auction.publisherId !== userId) {
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
    // Find auctions that have passed their end date
    const expiredAuctions = await this.auctionRepository.find({
      where: {
        endDate: LessThan(new Date()),
        auctionStatus: AuctionStatus.ACTIVE,
      },
      relations: ['bids'],
    });

    for (const auction of expiredAuctions) {
      // Mark auction as completed
      auction.auctionStatus = AuctionStatus.COMPLETED;
      await this.auctionRepository.save(auction);

      // If there's a winning bidder, we could trigger contract creation here
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
    userId: number,
  ): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
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
