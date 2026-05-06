import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceOwnerGuard } from '../common/guards/workspace-owner.guard';

@Module({
  imports: [AuthModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceOwnerGuard],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
