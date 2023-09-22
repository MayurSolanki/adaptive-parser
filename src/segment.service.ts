/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Parser as M3U8Parser } from 'm3u8-parser'; //Import the correct class
import axios from 'axios';
import xml2js from 'xml2js';
import { DashMPD } from '@liveinstantly/dash-mpd-parser';
import { m3u8Parser, mpdParser } from "@soundws/mpd-m3u8-to-json"

@Injectable()
export class SegmentService {

    async m3u8ToJson(url: string): Promise<any> {
        const results = []


        const m3u8 = `
#EXTM3U
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXTINF:9
1.ts
#EXTINF:9
2.ts
EXT-X-DISCONTINUITY
#EXTINF:3,
3.ts
#EXT-X-ENDLIST
`

        const data = m3u8Parser(m3u8, url, (tagInfo, result) => {
            // do something with current parsed tag
            console.log("tagInfo : ", tagInfo);
            console.log("result : ", result);

            return result; // must return
        })

        results.push(data)
        return results;
    }

    async mpdToJson(url: string): Promise<any> {
        const results = []
        const response = await axios.get(url);
        const manifestXML = response.data;

        const data = mpdParser(manifestXML, (tagName, attrs) => {
            if (tagName === 'segmentTemplate') {
                attrs.duration = parseFloat(attrs.duration)
            }
            if (tagName === 'xxxx') {
                //
            }
            return attrs // must return
        })

        results.push(data)
        return results;
    }

    // async fetchAndProcessHLS(hlsUrl: string) {
    //     try {
    //         const response = await axios.get(hlsUrl);
    //         const m3u8Content = response.data;
    //         // eslint-disable-next-line prettier/prettier
    //         const parser = new M3U8Parser();
    //         parser.push(m3u8Content);
    //         parser.end();

    //         const playlist = parser.manifest;

    //         if (playlist && playlist.segments) {
    //             return playlist.segments.map((segment) => ({
    //                 url: segment.uri,
    //                 duration: segment.duration,
    //                 title: segment.title || '',
    //             }));
    //         } else {
    //             throw new Error('Invalid HLS M3U8 playlist.');
    //         }
    //     } catch (error) {
    //         throw new Error('Failed to fetch or parse HLS M3U8: ' + error.message);
    //     }
    // }

    // async fetchAndProcessMPD(mpdUrl: string) {
    //     try {
    //         // const response = await axios.get(mpdUrl);
    //         //  const mpdContent = response.data;

    //         const response = await axios.get(mpdUrl);
    //         const manifestXML = response.data;

    //         // Parse the MPEG-DASH manifest
    //         const mpd = new DashMPD();
    //         mpd.parse(manifestXML);

    //         const mpdJson = mpd.getJSON();
    //         mpd.setJSON(mpdJson); //

    //         const adaptations = mpdJson?.['MPD'].Period[0].AdaptationSet;

    //         const mpdSegments = [];


    //         if (adaptations) {
    //             adaptations.forEach((adaptationSet) => {
    //                 const representation = adaptationSet.Representation[0];
    //                 if (representation && representation.SegmentList) {
    //                     const segmentList = representation.SegmentList[0];
    //                     if (segmentList && segmentList.SegmentURL) {
    //                         segmentList.SegmentURL.forEach((segment) => {
    //                             mpdSegments.push({
    //                                 url: segment.media,
    //                                 duration: parseFloat(segmentList.duration),
    //                                 title: representation.id || '',
    //                             });
    //                         });
    //                     }
    //                 }
    //             });
    //         }

    //         return mpdSegments;
    //     } catch (error) {
    //         throw new Error('Failed to fetch or parse MPD: ' + error.message);
    //     }
    // }

    // async consolidateSegments(hlsUrl: string, mpdUrl: string) {
    //     try {
    //         const hlsSegments = await this.fetchAndProcessHLS(hlsUrl);
    //         const mpdSegments = await this.fetchAndProcessMPD(mpdUrl);

    //         console.log('hlsSegments : ', hlsSegments);
    //         console.log('mpdSegments : ', mpdSegments);

    //         // Combine HLS and MPD segments into a single array
    //         const allSegments = [...hlsSegments, ...mpdSegments];

    //         console.log('Consolidated Segment Information:', allSegments);
    //         allSegments.forEach((segment, index) => {
    //             console.log(`Segment ${index + 1}:`);
    //             console.log('URL:', segment.url);
    //             console.log('Duration:', segment.duration);
    //             console.log('Title:', segment.title);
    //             console.log('---');
    //         });
    //     } catch (error) {
    //         console.error(error.message);
    //     }
    // }

    // consolidateSegments();
}
