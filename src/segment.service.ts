/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Parser as M3U8Parser } from 'm3u8-parser'; //Import the correct class
import axios from 'axios';
import xml2js from 'xml2js';
import { DashMPD } from '@liveinstantly/dash-mpd-parser';

@Injectable()
export class SegmentService {

    async fetchAndProcessHLS(hlsUrl: string) {
        try {
            const response = await axios.get(hlsUrl);
            const m3u8Content = response.data;
            // eslint-disable-next-line prettier/prettier
            const parser = new M3U8Parser();
            parser.push(m3u8Content);
            parser.end();

            const playlist = parser.manifest;

            if (playlist && playlist.segments) {
                return playlist.segments.map((segment) => ({
                    url: segment.uri,
                    duration: segment.duration,
                    title: segment.title || '',
                }));
            } else {
                throw new Error('Invalid HLS M3U8 playlist.');
            }
        } catch (error) {
            throw new Error('Failed to fetch or parse HLS M3U8: ' + error.message);
        }
    }

    async fetchAndProcessMPD(mpdUrl: string) {
        try {
            // const response = await axios.get(mpdUrl);
            //  const mpdContent = response.data;

            const response = await axios.get(mpdUrl);
            const manifestXML = response.data;

            // Parse the MPEG-DASH manifest
            const mpd = new DashMPD();
            mpd.parse(manifestXML);

            const mpdJson = mpd.getJSON();
            mpd.setJSON(mpdJson); //

            const adaptations = mpdJson?.['MPD'].Period[0].AdaptationSet;

            const mpdSegments = [];


            if (adaptations) {
                adaptations.forEach((adaptationSet) => {
                    const representation = adaptationSet.Representation[0];
                    if (representation && representation.SegmentList) {
                        const segmentList = representation.SegmentList[0];
                        if (segmentList && segmentList.SegmentURL) {
                            segmentList.SegmentURL.forEach((segment) => {
                                mpdSegments.push({
                                    url: segment.media,
                                    duration: parseFloat(segmentList.duration),
                                    title: representation.id || '',
                                });
                            });
                        }
                    }
                });
            }

            return mpdSegments;
        } catch (error) {
            throw new Error('Failed to fetch or parse MPD: ' + error.message);
        }
    }

    async consolidateSegments(hlsUrl: string, mpdUrl: string) {
        try {
            const hlsSegments = await this.fetchAndProcessHLS(hlsUrl);
            const mpdSegments = await this.fetchAndProcessMPD(mpdUrl);

            console.log('hlsSegments : ', hlsSegments);
            console.log('mpdSegments : ', mpdSegments);

            // Combine HLS and MPD segments into a single array
            const allSegments = [...hlsSegments, ...mpdSegments];

            console.log('Consolidated Segment Information:', allSegments);
            allSegments.forEach((segment, index) => {
                console.log(`Segment ${index + 1}:`);
                console.log('URL:', segment.url);
                console.log('Duration:', segment.duration);
                console.log('Title:', segment.title);
                console.log('---');
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    // consolidateSegments();
}
