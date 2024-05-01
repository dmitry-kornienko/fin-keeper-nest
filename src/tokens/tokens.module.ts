import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token, TokenSchema } from './token.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{name: Token.name, schema: TokenSchema}]),
  ],
  providers: [TokensService],
  controllers: [TokensController],
  exports: [TokensService]
})
export class TokensModule {}
