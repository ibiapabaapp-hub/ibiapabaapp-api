import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDTO {
  @ApiPropertyOptional({ description: "Slug único para o perfil" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: "Nome de exibição" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  display_name?: string;

  @ApiPropertyOptional({ description: "Biografia" })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: "URL do avatar" })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
