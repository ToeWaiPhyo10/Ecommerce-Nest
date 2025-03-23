import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { Profile } from './profile/profile.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './category/category.entity';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', //process.env.DB_HOST
      port: 3306, //parseInt(process.env.DB_Port, 10)
      username: 'root', //process.env.DB_USERNAME
      password: 'Apple@123', //process.env.DB_PASSWORD
      database: 'ecommerceDB', //process.env.DB_DATABASE
      entities: [User, Profile, Category],
      synchronize: false,
      autoLoadEntities: true,
    }),
    UserModule,
    AuthModule,
    ProfileModule,
    CategoryModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
