import { Equals, IsBoolean, IsPhoneNumber, IsUUID } from 'class-validator';
export class ClientLinkQueryDto {
  @IsPhoneNumber() phone!: string;
}

export class LinkClientHistoryDto {
  @IsUUID() clientId!: string;
  @IsPhoneNumber() phone!: string;
  @IsBoolean() @Equals(true) identityConfirmed!: boolean;
}
