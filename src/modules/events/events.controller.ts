import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
} from '@nestjs/swagger';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

@Controller({ path: 'events', version: '1' })
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@ApiBearerAuth()
	@ApiBody({ type: CreateEventDto })
	@ApiOperation({ summary: 'Cria um novo evento' })
	@ApiResponse({ status: 201, type: Event })
	@Post()
	create(@Body() createEventDto: CreateEventDto) {
		return this.eventsService.create(createEventDto);
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtém todos os eventos' })
	@ApiResponse({ status: 200, type: Event, isArray: true })
	@Get()
	findAll() {
		return this.eventsService.findAll();
	}

	@ApiBearerAuth()
	@ApiOperation({ summary: 'Buscar um evento pelo ID' })
	@ApiParam({ name: 'id', description: 'UUID do evento' })
	@ApiResponse({ status: 200, type: Event })
	@ApiResponse({ status: 404, description: 'Evento não encontrado' })
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.eventsService.findOne(id);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID do evento' })
	@ApiBody({ type: UpdateEventDto })
	@ApiOperation({ summary: 'Atualizar dados de um evento' })
	@ApiResponse({ status: 200, type: Event })
	@Patch(':id')
	update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
		return this.eventsService.update(id, updateEventDto);
	}

	@ApiBearerAuth()
	@ApiParam({ name: 'id', description: 'UUID do evento' })
	@ApiOperation({ summary: 'Remover um evento' })
	@ApiResponse({ status: 200, description: 'Mensagem de sucesso' })
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.eventsService.remove(id);
	}
}
