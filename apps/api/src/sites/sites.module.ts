import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SitesService } from './sites.service';
import { WorkspaceSitesController } from './workspace-sites.controller';
import { SitesOpsController } from './sites-ops.controller';
import { SiteOwnerGuard } from '../common/guards/site-owner.guard';
import { ScansModule } from '../scans/scans.module';

@Module({
  imports: [AuthModule, ScansModule],
  controllers: [WorkspaceSitesController, SitesOpsController],
  providers: [SitesService, SiteOwnerGuard],
  exports: [SitesService],
})
export class SitesModule {}
