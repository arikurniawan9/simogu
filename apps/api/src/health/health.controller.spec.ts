import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { describe, it, expect, beforeEach } from 'vitest';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return system health status', () => {
    const response = controller.getHealth();
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('ok');
    expect(response.data?.service).toBe('SIMOGU API');
  });
});
