import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Requires param `siteId` and JWT user; site workspace must be owned by user. */
@Injectable()
export class SiteOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub as string | undefined;
    const siteId = req.params?.siteId as string | undefined;
    if (!userId || !siteId) {
      throw new ForbiddenException();
    }
    const site = await this.prisma.site.findFirst({
      where: {
        id: siteId,
        workspace: { ownerId: userId },
      },
      include: { workspace: true },
    });
    if (!site) {
      throw new ForbiddenException('Site not found');
    }
    req.site = site;
    return true;
  }
}
