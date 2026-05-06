import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { ScanProcessor } from './scan.processor';
import { ScanRunnerService } from './scan-runner.service';
import { ScoringModule } from '../scoring/scoring.module';

const useQueue = process.env.SYNC_SCANS !== '1';

@Module({
  imports: [
    AuthModule,
    ...(useQueue ? [BullModule.registerQueue({ name: 'scans' })] : []),
    ScoringModule,
  ],
  controllers: [ScansController],
  providers: [
    ScanRunnerService,
    ScansService,
    ...(useQueue ? [ScanProcessor] : []),
  ],
  exports: [ScansService],
})
export class ScansModule {}
