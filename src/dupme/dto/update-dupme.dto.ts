import { PartialType } from '@nestjs/mapped-types';
import { CreateDupmeDto } from './create-dupme.dto';

export class UpdateDupmeDto extends PartialType(CreateDupmeDto) {
  id: number;
}
