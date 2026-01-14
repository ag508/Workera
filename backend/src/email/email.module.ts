import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkeraEmailService } from './workera-email.service';
import { OTPService } from './otp.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [WorkeraEmailService, OTPService],
  exports: [WorkeraEmailService, OTPService],
})
export class EmailModule {}
