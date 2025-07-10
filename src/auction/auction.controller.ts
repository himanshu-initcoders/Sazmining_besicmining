import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  // PUBLIC ENDPOINTS

  /**
   * Get all active auctions (public)
   * GET /auctions/public
   */
  @Get('public')
  async getPublicAuctions() {
    return this.auctionService.findAll('Active');
  }

  /**
   * Get auction details by ID (public)
   * GET /auctions/public/:id
   */
  @Get('public/:id')
  async getPublicAuction(@Param('id', ParseIntPipe) id: number) {
    return this.auctionService.findOne(id);
  }

  // PROTECTED ENDPOINTS

  /**
   * Create a new auction
   * POST /auctions
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createAuction(
    @Body() createAuctionDto: CreateAuctionDto, 
    @Request() req,
  ) {
    return this.auctionService.createAuction(
      createAuctionDto, 
      req.user.id,
    );
  }

  /**
   * Get all auctions with optional status filter (admin)
   * GET /auctions
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllAuctions(@Query('status') status?: string) {
    return this.auctionService.findAll(status);
  }

  /**
   * Get auction by ID
   * GET /auctions/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAuction(@Param('id', ParseIntPipe) id: number) {
    return this.auctionService.findOne(id);
  }

  /**
   * Get auctions created by current user
   * GET /auctions/my
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyAuctions(
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.auctionService.findByUser(req.user.id, status);
  }

  /**
   * Get auctions the current user has bid on
   * GET /auctions/my/bids
   */
  @Get('my/bids')
  @UseGuards(JwtAuthGuard)
  async getMyBids(@Request() req) {
    return this.auctionService.findUserBids(req.user.id);
  }

  /**
   * Place a bid on an auction
   * POST /auctions/bid
   */
  @Post('bid')
  @UseGuards(JwtAuthGuard)
  async placeBid(
    @Body() placeBidDto: PlaceBidDto, 
    @Request() req,
  ) {
    return this.auctionService.placeBid(
      placeBidDto, 
      req.user.id,
    );
  }

  /**
   * End an auction (seller only)
   * PATCH /auctions/:id/end
   */
  @Patch(':id/end')
  @UseGuards(JwtAuthGuard)
  async endAuction(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req,
  ) {
    return this.auctionService.endAuction(id, req.user.id);
  }

  /**
   * Cancel an auction (seller only, if no bids)
   * PATCH /auctions/:id/cancel
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelAuction(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req,
  ) {
    return this.auctionService.cancelAuction(id, req.user.id);
  }
} 