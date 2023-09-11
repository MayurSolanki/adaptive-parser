import { Injectable } from '@nestjs/common';
import { Parser as M3U8Parser } from 'm3u8-parser'; //Import the correct class
import axios from 'axios';
import { DashMPD } from '@liveinstantly/dash-mpd-parser';
import { parseString } from 'xml2js';
import urljoin from 'url-join';

// import { DashParser } from 'dash-parser'; // Import the MPEG-DASH parser
// import xml2js from 'xml2js';

@Injectable()
export class AppService {
  async parseMPD(mpdURL: string) {
    try {
      const response = await axios.get(mpdURL);
      const manifestXML = response.data;

      // Parse the MPEG-DASH manifest
      const mpd = new DashMPD();
      mpd.parse(manifestXML);

      const mpdJson = mpd.getJSON();
      // Operate MPD manifest JSON object (mpd.mpd) for your manifest manipulation
      mpd.setJSON(mpdJson); //

      // eslint-disable-next-line prettier/prettier
      console.log("mpdJson :=> ", JSON.stringify(mpdJson));

      // Extract video representations from the parsed manifest
      const adaptations = mpdJson?.['MPD'].Period[0].AdaptationSet;

      //   const videoData = [];
      //   for (const data of adaptations) {
      //     if (data['@mimeType']?.startsWith('video/')) {
      //       console.log('data', data);
      //       videoData.push(data['@id']);
      //       videoData.push(data['@width']);
      //       videoData.push(data['@height']);
      //     }
      //   }
      //   return videoData;
      // } catch (error) {
      //   console.error('Error:', error);
      //   return [];
      // }


      const videoRepresentations = adaptations
        .filter((adaptation) => adaptation['@mimeType'].startsWith('video/'))
        .map((adaptation) => ({
          mimeType: adaptation['@mimeType'],
          representations: adaptation.Representation.map((representation) => ({
            id: representation['@id'],
            width: representation['@width'],
            height: representation['@height'],
            frameRate: representation['@frameRate'],
            bandwidth: representation['@bandwidth'],
            codecs: representation['@codecs'],
            baseURL: representation.BaseURL[0],
          })),
        }));

      // Return video representation information as JSON
      return videoRepresentations;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async parseM3U8_(m3u8URL: string) {
    try {
      // Fetch the M3U8 manifest
      const response = await axios.get(m3u8URL);
      const manifestText = response.data;

      // Parse the M3U8 manifest and extract video TS file links
      const videoFiles = {};

      // Split the manifest into lines
      const lines = manifestText.split('\n');

      let currentResolution = '';
      for (const line of lines) {
        if (line.startsWith('#EXT-X-STREAM-INF')) {
          // Extract the resolution from the stream info line
          const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
          if (resolutionMatch) {
            currentResolution = resolutionMatch[1];
            videoFiles[currentResolution] = [];
          }
        } else if (line.trim() && !line.startsWith('#')) {
          // If not a comment or empty line, add the video TS file link
          videoFiles[currentResolution].push(line);
        }
      }

      // Return the video TS file links as a JSON object
      return videoFiles;
    } catch (error) {
      console.error('Error:', error);
      return {};
    }
  }

  // async getResolutionManifestURLs(rootManifestURL: string) {
  //   try {
  //     // Fetch the root manifest (MPD or M3U8)
  //     const response = await axios.get(rootManifestURL);
  //     const manifestText = response.data;

  //     // Parse the root manifest
  //     const manifestJson = await new Promise<any>((resolve, reject) => {
  //       parseString(manifestText, (err, result) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve(result);
  //         }
  //       });
  //     });

  //     // Define an array to store resolution-specific manifest URLs
  //     const resolutionManifestURLs: string[] = [];

  //     // Extract resolution-specific manifest URLs based on the manifest format (MPD or M3U8)
  //     if (rootManifestURL.endsWith('.mpd')) {
  //       // Parsing an MPD manifest
  //       const adaptationSets = manifestJson.MPD.Period[0].AdaptationSet;
  //       for (const adaptationSet of adaptationSets) {
  //         if (
  //           adaptationSet.$.mimeType &&
  //           adaptationSet.$.mimeType.startsWith('video/')
  //         ) {
  //           // This adaptation set corresponds to a video stream
  //           const representations = adaptationSet.Representation;
  //           for (const representation of representations) {
  //             if (representation.BaseURL) {
  //               // Extract the resolution-specific manifest URL for each representation
  //               resolutionManifestURLs.push(representation.BaseURL[0]);
  //             }
  //           }
  //         }
  //       }
  //     } else if (rootManifestURL.endsWith('.m3u8')) {
  //       // Parsing an M3U8 manifest
  //       const lines = manifestText.split('\n');
  //       for (const line of lines) {
  //         if (line.startsWith('#EXT-X-STREAM-INF')) {
  //           // Extract the resolution-specific manifest URL from the EXT-X-STREAM-INF line
  //           const resolutionURL = lines[lines.indexOf(line) + 1];
  //           resolutionManifestURLs.push(resolutionURL);
  //         }
  //       }
  //     }

  //     // Return the resolution-specific manifest URLs
  //     return resolutionManifestURLs;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     return [];
  //   }
  // }

  // async parseChildManifest(
  //   childURL: string,
  //   baseURL: string,
  // ): Promise<string[]> {
  //   try {
  //     const response = await axios.get(childURL);
  //     const manifestText = response.data;

  //     // Parse the child manifest
  //     const parsedManifest = await new Promise<string[]>((resolve, reject) => {
  //       const parsedUrls: string[] = [];
  //       const lines = manifestText.split('\n');

  //       for (const line of lines) {
  //         if (line.trim() && !line.startsWith('#')) {
  //           // Resolve relative URLs to full URLs using the base URL
  //           const fullURL = urljoin(baseURL, line.trim());
  //           parsedUrls.push(fullURL);
  //         }
  //       }

  //       resolve(parsedUrls);
  //     });

  //     return parsedManifest;
  //   } catch (error) {
  //     console.error('Error:', error);
  //     return [];
  //   }
  // }

  getHello(): string {
    return 'Hello World!';
  }

  async parseM3U8(url: string): Promise<any> {
    const response = { baseUrl: '', entries: [], error: '' };

    try {
      const playlistContent = await axios.get(url);
      const parser = new M3U8Parser(); // Use the correct class constructor
      parser.push(playlistContent.data);
      parser.end();
      const playlist = parser.manifest;
      console.log('Parsed M3U8 playlist:', JSON.stringify(playlist, null, 2));

      response.baseUrl = url;
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
    // const videoTracks = parser.getVideoTracks();
    // console.log(videoTracks);
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
