import { ConfigService } from '@nestjs/config/dist/config.service';
export declare class AppService {
    private configService;
    constructor(configService: ConfigService);
    getHello(): string;
}
