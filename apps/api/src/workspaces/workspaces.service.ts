import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

function baseSlug(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || 'workspace';
}

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    const slug = `${baseSlug(dto.name)}-${randomBytes(4).toString('hex')}`;
    return this.prisma.workspace.create({
      data: {
        ownerId,
        name: dto.name,
        slug,
      },
    });
  }

  getOne(workspaceId: string, ownerId: string) {
    return this.prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId },
      include: {
        sites: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
