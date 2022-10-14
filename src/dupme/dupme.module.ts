import { Module } from '@nestjs/common';
import { DupmeService } from './dupme.service';
import { DupmeGateway } from './dupme.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/UserSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [DupmeGateway, DupmeService],
})
export class DupmeModule {}
