import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '../../common/redis/redis.module';
import { User, UserSchema } from '../../schemas/user.schema';
// import { UsersModule } from '../users/users.module';
import { AuthSimpleService } from './auth-simple.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
// import { LTIStrategy } from './strategies/lti.strategy';
// import { OAuth2Strategy } from './strategies/oauth2.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    // UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthSimpleService, JwtStrategy, LocalStrategy],
  exports: [AuthSimpleService, JwtModule],
})
export class AuthModule {}
