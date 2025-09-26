import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<string>('port');
    console.log('Port from config:', port);
    return `Hello World! Server is running on port ${port}`;
  }
}
