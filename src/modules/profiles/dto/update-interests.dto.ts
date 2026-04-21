import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID, IsOptional } from "class-validator";

export class UpdateInterestsDTO {
  @ApiProperty({
    description: "IDs das categorias de interesse de negócios",
    type: [String],
    example: ["uuid1", "uuid2"],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  businesses?: string[];

  @ApiProperty({
    description: "IDs das categorias de interesse de eventos",
    type: [String],
    example: ["uuid1", "uuid2"],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  events?: string[];
}
