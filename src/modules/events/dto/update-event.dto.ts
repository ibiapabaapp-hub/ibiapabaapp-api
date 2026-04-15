import { PartialType } from '@nestjs/swagger';

import { CreateEventDTO } from './create-event.dto';

export class UpdateEventDTO extends PartialType(CreateEventDTO) {}
