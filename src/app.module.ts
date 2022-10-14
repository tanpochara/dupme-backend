import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DupmeModule } from './dupme/dupme.module';

@Module({
  imports: [
    DupmeModule,
    MongooseModule.forRoot(
      'mongodb+srv://root:dupme@cluster0.tjk8y.mongodb.net/?retryWrites=true&w=majority',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
