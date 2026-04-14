import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";

import { ProfileOwnershipGuard } from "./guards/profile-ownership.guard";
import { CreateProfileDTO } from "./dto/create-profile.dto";
import { ProfileResponseDTO } from "./dto/profile-response.dto";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { UpdateInterestsDTO } from "./dto/update-interests.dto";
import { ProfilesService } from "./profiles.service";
import { ProfileInterestsService } from "./interests.service";

@Controller({ path: "accounts/:accountId/profiles", version: "1" })
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly profileInterestsService: ProfileInterestsService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria um novo perfil para a conta" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiResponse({ status: 201, type: ProfileResponseDTO })
  @Post()
  create(
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Body() createProfileDto: CreateProfileDTO,
  ) {
    return this.profilesService.create(accountId, createProfileDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtém todos os perfis da conta" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO, isArray: true })
  @Get()
  findAll(@Param("accountId", ParseUUIDPipe) accountId: string) {
    return this.profilesService.findAllByAccountId(accountId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtém um perfil específico" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiParam({ name: "id", description: "UUID do perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @ApiResponse({ status: 401, description: "Não autorizado" })
  @UseGuards(ProfileOwnershipGuard)
  @Get(":id")
  findOne(
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.profilesService.findOneById(id, accountId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza um perfil" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiParam({ name: "id", description: "UUID do perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Patch(":id")
  update(
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDTO,
  ) {
    return this.profilesService.update(id, accountId, updateProfileDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove um perfil" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiParam({ name: "id", description: "UUID do perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Delete(":id")
  remove(
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.profilesService.remove(id, accountId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Substitui todos os interesses de um perfil" })
  @ApiParam({ name: "accountId", description: "UUID da conta" })
  @ApiParam({ name: "id", description: "UUID do perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Post(":id/interests")
  upsertInterests(
    @Param("accountId", ParseUUIDPipe) accountId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateInterestsDto: UpdateInterestsDTO,
  ) {
    return this.profileInterestsService.upsert(
      id,
      accountId,
      updateInterestsDto.interests,
    );
  }
}
