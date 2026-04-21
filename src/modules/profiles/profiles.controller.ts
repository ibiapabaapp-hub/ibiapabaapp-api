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
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { CurrentAccount } from "../common/decorators/current-account.decorator";
import { CreateProfileWithAccountDTO } from "./dto/profile-account.dto";
import { ProfileResponseDTO } from "./dto/profile-response.dto";
import { UpdateInterestsDTO } from "./dto/update-interests.dto";
import { UpdateProfileDTO } from "./dto/update-profile.dto";
import { ProfileOwnershipGuard } from "./guards/profile-ownership.guard";
import { ProfileInterestsService } from "./interests.service";
import { ProfilesService } from "./profiles.service";

@Controller({ path: "profiles", version: "1" })
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly profileInterestsService: ProfileInterestsService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Cria um novo perfil para a conta autenticada" })
  @ApiResponse({ status: 201, type: ProfileResponseDTO })
  @Post()
  create(
    @CurrentAccount() account: { id: string },
    @Body() dto: CreateProfileWithAccountDTO,
  ) {
    return this.profilesService.create(account.id, {
      slug: dto.slug,
      display_name: dto.display_name,
      type: dto.type,
      bio: dto.bio,
      avatar_url: dto.avatar_url,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtém todos os perfis da conta autenticada" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO, isArray: true })
  @Get()
  findAll(@CurrentAccount() account: { id: string }) {
    return this.profilesService.findAllByAccountId(account.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtém um perfil específico" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @ApiResponse({ status: 401, description: "Não autorizado" })
  @UseGuards(ProfileOwnershipGuard)
  @Get(":id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAccount() account: { id: string },
  ) {
    return this.profilesService.findOneById(id, account.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Atualiza um perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAccount() account: { id: string },
    @Body() dto: UpdateProfileDTO,
  ) {
    return this.profilesService.update(id, account.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove um perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Delete(":id")
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAccount() account: { id: string },
  ) {
    return this.profilesService.remove(id, account.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtém todos os interesses de um perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Get(":id/interests")
  getInterests(@Param("id", ParseUUIDPipe) accountId: string) {
    return this.profileInterestsService.findAllByProfileId(accountId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Substitui todos os interesses de um perfil" })
  @ApiResponse({ status: 200, type: ProfileResponseDTO })
  @UseGuards(ProfileOwnershipGuard)
  @Post(":id/interests")
  upsertInterests(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentAccount() account: { id: string },
    @Body() dto: UpdateInterestsDTO,
  ) {
    return this.profileInterestsService.upsert(account.id, id, dto);
  }
}
