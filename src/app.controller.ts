import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('playlist')
export class AppController {
  constructor(private readonly appService: AppService) {
    //
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('parse/m3u8')
  async parseM3U8(@Body() body: { url: string }): Promise<any> {
    const url = body.url;
    console.log('url', url);
    if (!url.endsWith('.m3u8')) {
      throw new HttpException('invalid url type', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.parseM3U8(url);
  }

  @Post('parse/mpd')
  async parseMpegDash(@Body() body: { url: string }): Promise<any> {
    const url = body.url;
    console.log('url', url);
    if (!url.endsWith('.mpd')) {
      throw new HttpException('invalid url type', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.parseMpegDash(url);
  }
}
