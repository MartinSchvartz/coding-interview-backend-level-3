import { Entity, PrimaryGeneratedColumn, Column, AfterLoad } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @AfterLoad()
  convertPriceToNumber() {
    if (typeof this.price === 'string') {
      this.price = parseFloat(this.price);
    }
  }
} 