import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ScanRunnerService } from './scan-runner.service';

@Processor('scans')
export class ScanProcessor extends WorkerHost {
  constructor(private readonly runner: ScanRunnerService) {
    super();
  }

  async process(job: Job<{ scanId: string }>): Promise<void> {
    await this.runner.execute(job.data.scanId);
  }
}
