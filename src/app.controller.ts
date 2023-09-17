import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SegmentService } from './segment.service';

@Controller('playlist')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly segmentService: SegmentService,
  ) {
    //
    // this.appService
    //   .parseM3U8_('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
    //   .then((videoFiles) => {
    //     console.log(JSON.stringify(videoFiles, null, 2));
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
    // this.appService
    //   .parseMPD("https://dash.akamaized.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd")
    //   .then((videoRepresentations) => {
    //     console.log(JSON.stringify(videoRepresentations, null, 2));
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
    // this.appService
    //   .getResolutionManifestURLs(
    //    // 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    //      'https://dash.akamaized.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd',
    //   )
    //   .then((resolutionManifestURLs) => {
    //     //
    //     // console.log(JSON.stringify(resolutionManifestURLs, null, 2));
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
    // this.appService
    //   .parseChildManifest(
    //     'https://dash.akamaized.net/dash264/TestCases/1a/sony/DASH_vodvideo_Track2.m4v',
    //     'https://dash.akamaized.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd',
    //   )
    //   .then((resolutionManifestURLs) => {
    //     console.log(
    //       'resolutionManifestURLs : => ',
    //       JSON.stringify(resolutionManifestURLs, null, 2),
    //     );
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
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
    return await this.appService.parseM3U8(url); //
  }

  @Post('parse/mpd')
  async parseMpegDash(@Body() body: { url: string }): Promise<any> {
    const url = body.url;
    console.log('url', url);
    if (!url.endsWith('.mpd')) {
      throw new HttpException('invalid url type', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.parseMpegDash(url); //
  }

  @Post('parse/both')
  async parseBoth(
    @Body() body: { m3u8Url: string; mpdUrl: string },
  ): Promise<any> {
    const m3u8Url = body.m3u8Url;
    const mpdUrl = body.mpdUrl;

    console.log('m3u8Url', m3u8Url);
    console.log('mpdUrl', mpdUrl);

    if (!mpdUrl.endsWith('.mpd') || !m3u8Url.endsWith('.m3u8')) {
      throw new HttpException('invalid url type', HttpStatus.BAD_REQUEST);
    }
    return await this.segmentService.consolidateSegments(m3u8Url, mpdUrl); //comment
  }
}
