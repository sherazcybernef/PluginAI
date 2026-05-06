import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceOwnerGuard } from '../common/guards/workspace-owner.guard';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(user.sub, dto);
  }

  @Get(':workspaceId')
  @UseGuards(JwtAuthGuard, WorkspaceOwnerGuard)
  getOne(@Param('workspaceId') workspaceId: string, @CurrentUser() user: JwtPayload) {
    return this.workspaces.getOne(workspaceId, user.sub);
  }
}
