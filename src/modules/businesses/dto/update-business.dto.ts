import { PartialType } from '@nestjs/swagger';

import { CreateBusinessDTO } from './create-business.dto';

export class UpdateBusinessDTO extends PartialType(CreateBusinessDTO) {}
