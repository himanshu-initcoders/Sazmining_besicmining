import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @ObjectIdColumn()
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => CartItem, cartItem => cartItem.cartId)
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 