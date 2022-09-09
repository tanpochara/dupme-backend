import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DupmeModule } from './dupme/dupme.module';

@Module({
  imports: [DupmeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
