import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCartByUserId(req.user.id);
  }

  @Post('items')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItemToCart(
      req.user.id,
      addToCartDto.productId,
      addToCartDto.quantity,
    );
  }

  @Patch('items/:itemId')
  async updateCartItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItemQuantity(
      req.user.id,
      itemId,
      updateCartItemDto.quantity,
    );
  }

  @Delete('items/:itemId')
  async removeCartItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeItemFromCart(req.user.id, itemId);
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
