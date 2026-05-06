import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { SitesModule } from './sites/sites.module';
import { ScansModule } from './scans/scans.module';
import { ScoringModule } from './scoring/scoring.module';

const useQueue = process.env.SYNC_SCANS !== '1';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(useQueue
      ? [
          BullModule.forRoot({
            connection: {
              url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
            },
          }),
        ]
      : []),
    PrismaModule,
    ScoringModule,
    AuthModule,
    MeModule,
    WorkspacesModule,
    SitesModule,
    ScansModule,
  ],
})
export class AppModule {}
