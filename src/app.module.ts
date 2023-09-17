import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SegmentService } from './segment.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SegmentService],
})
export class AppModule { }
