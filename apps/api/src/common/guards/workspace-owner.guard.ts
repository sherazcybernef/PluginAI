import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Requires route param `workspaceId` and JWT user; workspace must be owned by user. */
@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub as string | undefined;
    const workspaceId = req.params?.workspaceId as string | undefined;
    if (!userId || !workspaceId) {
      throw new ForbiddenException();
    }
    const ws = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: userId },
    });
    if (!ws) {
      throw new ForbiddenException('Workspace not found');
    }
    req.workspace = ws;
    return true;
  }
}
