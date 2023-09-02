import { Injectable } from '@nestjs/common';
import { Parser as M3U8Parser } from 'm3u8-parser'; // Import the correct class
import axios from 'axios';
import { DashMPD } from '@liveinstantly/dash-mpd-parser';

// import { DashParser } from 'dash-parser'; // Import the MPEG-DASH parser

// import xml2js from 'xml2js';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async parseM3U8(url: string): Promise<any> {
    const response = { maniUrl: '', entries: [], error: '' };

    try {
      const playlistContent = await axios.get(url);
      const parser = new M3U8Parser(); // Use the correct class constructor
      parser.push(playlistContent.data);
      parser.end();
      const playlist = parser.manifest;
      console.log('Parsed M3U8 playlist:', JSON.stringify(playlist, null, 2));

      response.maniUrl = url;
      for (const uri of playlist.playlists) {
        // console.log('segment', segment);

        response.entries.push({ url: uri });
      }
    } catch (error) {
      console.log('error : => ', error);
      response.error = error.message;
    }

    return response;
  }

  async parseMpegDash(
    manifestURL: string,
  ): Promise<{ resolution: string; videoURL: string }[]> {
    const response = await axios.get(manifestURL);
    const manifestXML = response.data;

    // Parse the MPEG-DASH manifest
    const mpd = new DashMPD();
    mpd.parse(manifestXML);

    const mpdJson = mpd.getJSON();
    // Operate MPD manifest JSON object (mpd.mpd) for your manifest manipulation
    mpd.setJSON(mpdJson);

    // Get XML DASH MPD manifest after operation
    const mpdXml = mpd.getMPD();
    console.log(mpdXml);


    // // Extract video tracks and their URLs
    const videoTracks = parser.getVideoTracks();
    console.log(videoTracks);
    // const resolutionLinks = videoTracks.map((track) => ({
    //   resolution: `${track.height}p`,
    //   videoURL: track.url,
    // }));

    return mpdJson;
    // let videoLinks;
    // try {
    //   // Fetch the MPD content from the URL
    //   const response = await axios.get(mpdUrl);
    //   const mpdContent = response.data;

    //   // Parse the MPD content
    //   const mpdTree = parseMPD(mpdContent);

    //   // Extract available video representations
    //   const videoRepresentations = mpdTree.periods[0].adaptationSets.filter(
    //     (set) => set.contentType === 'video',
    //   )[0].representations;

    //   // Prepare links for different resolutions
    //   videoLinks = videoRepresentations.map((representation) => ({
    //     resolution: `${representation.width}x${representation.height}`,
    //     // eslint-disable-next-line prettier/prettier
    //     link: `${mpdUrl.substring(0, mpdUrl.lastIndexOf('/') + 1)}${representation.baseUrl}`,
    //   }));
    // } catch (error) {
    //   throw new HttpException(
    //     'Failed to parse MPD file.',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    // return {
    //   videoLinks,
    // };
  }
}
