import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Parser as M3U8Parser } from 'm3u8-parser'; // Import the correct class
import { parse as parseMPD } from 'mpd-parser';
import axios from 'axios';

@Controller('playlist')
export class AppController {
  constructor(private readonly appService: AppService) {
    //
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('parse')
  async parsePlaylist(@Body() body: { url: string }): Promise<any> {
    const url = body.url;
    console.log('url', url);

    const response = { url: String, entries: [], error: String };

    try {
      const playlistContent = await axios.get(url);

      if (url.endsWith('.m3u8')) {
        const parser = new M3U8Parser(); // Use the correct class constructor
        parser.push(playlistContent.data);
        parser.end();
        const playlist = parser.manifest;
        console.log('Parsed M3U8 playlist:', JSON.stringify(playlist, null, 2));

        for (const uri of playlist.playlists) {
          // console.log('segment', segment);
          response.entries.push({ url: uri });
        }
        // console.log('response.entries', JSON.stringify(response.entries));
      } else if (url.endsWith('.mpd')) {
        const manifest = parseMPD(playlistContent.data.buffer);
        for (const period of manifest.periods) {
          for (const adaptationSet of period.adaptationSets) {
            for (const representation of adaptationSet.representations) {
              response.entries.push({ url: representation.baseUrl });
            }
          }
        }
      }
    } catch (error) {
      console.log('error', error);
      response.error = error.message;
    }

    return response;
  }
}
