import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { ApiResponse, SystemHealthStatus } from '@simogu/types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  @ApiOperation({ summary: 'Periksa status kesehatan layanan API' })
  @SwaggerResponse({ status: 200, description: 'Layanan API berjalan dengan baik' })
  getHealth(): ApiResponse<SystemHealthStatus> {
    const healthStatus: SystemHealthStatus = {
      status: 'ok',
      service: 'SIMOGU API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };

    return {
      success: true,
      data: healthStatus,
    };
  }
}
