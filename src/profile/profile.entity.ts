import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  IsNull,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gender: string;

  @Column({ default: '' })
  profile: string;

  @Column()
  phoneNo: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
