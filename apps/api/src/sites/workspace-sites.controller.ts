import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceOwnerGuard } from '../common/guards/workspace-owner.guard';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Controller('workspaces/:workspaceId/sites')
@UseGuards(JwtAuthGuard, WorkspaceOwnerGuard)
export class WorkspaceSitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  list(@Param('workspaceId') workspaceId: string) {
    return this.sites.list(workspaceId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateSiteDto,
  ) {
    return this.sites.create(workspaceId, dto);
  }
}
