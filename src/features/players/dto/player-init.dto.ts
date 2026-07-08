import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class PlayerInitDto {
    @MaxLength(100, { message: "Player UID must be at most 100 characters long" })
    @IsString({ message: "Player UID must be a string" })
    @IsNotEmpty({ message: "Player UID is required" })
    playerUid: string;

    @IsString({ message: "Name must be a string" })
    @IsOptional()
    name?: string;
}