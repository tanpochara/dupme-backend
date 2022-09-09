import { Module } from '@nestjs/common';
import { DupmeService } from './dupme.service';
import { DupmeGateway } from './dupme.gateway';

@Module({
  providers: [DupmeGateway, DupmeService]
})
export class DupmeModule {}
