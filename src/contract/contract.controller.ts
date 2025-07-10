import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  /**
   * Create a new contract (Buy Now)
   * POST /contracts
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createContract(
    @Body() createContractDto: CreateContractDto, 
    @Request() req,
  ) {
    return this.contractService.createContract(
      createContractDto, 
      req.user.id,
    );
  }

  /**
   * Get all contracts (admin only)
   * GET /contracts
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllContracts() {
    return this.contractService.findAll();
  }

  /**
   * Get contract by ID
   * GET /contracts/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getContract(@Param('id', ParseIntPipe) id: number) {
    return this.contractService.findOne(id);
  }

  /**
   * Get contract by contract ID string
   * GET /contracts/by-contract-id/:contractId
   */
  @Get('by-contract-id/:contractId')
  @UseGuards(JwtAuthGuard)
  async getContractByContractId(@Param('contractId') contractId: string) {
    return this.contractService.findByContractId(contractId);
  }

  /**
   * Get the current user's contracts
   * GET /contracts/my
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyContracts(@Request() req) {
    return this.contractService.findByBuyer(req.user.id);
  }
} 