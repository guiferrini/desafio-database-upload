import {
  Entity, // informa q vai referenciar (é uma entidade) no banco de dados
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Category from './Category';

// 1° passar o Decoretor(@) -> Entity,
// fala p classe q ela é uma entidade com o nome de transactions no BD
// @nome('tipo' - padrao é string)
@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(() => Category) // passa um parametro chamando o model(pasta) da coluna q faz referencia
  @JoinColumn({ name: 'category_id' }) // p saber qual pe a coluna q esta sendo utilizada p fazer o relacionamento
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
