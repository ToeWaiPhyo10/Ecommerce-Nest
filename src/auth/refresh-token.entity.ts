import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  userId: string;

  @Column()
  username: string;

  @Column()
  role: string;

  @Column()
  expiryDate: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
