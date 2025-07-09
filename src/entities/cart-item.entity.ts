import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.items)
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column()
  @IsNotEmpty()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
} 