import { Module } from '@nestjs/common';
import { AuthModule } from '../identity/auth.module';
import { CommerceService } from './application/commerce.service';
import { AdminWorkspaceController, ClientWorkspaceController, PublicController, StylistWorkspaceController } from './presentation/commerce.controller';
@Module({ imports: [AuthModule], providers: [CommerceService], controllers: [PublicController, ClientWorkspaceController, StylistWorkspaceController, AdminWorkspaceController] })
export class CommerceModule {}
