# lemcam

Tesla cam player

# Tesla Referral Link

If you want to reward my job, use and share my Tesla Referral Link:

https://ts.la/vianney37486

# Todo

* Better welcome with main features (view / merge / upload / share)
* Add url in the Video and use it on the video template (use blaze to set the source)
* Rename viewer into sequence
* Display video progress (upload, encoding)
* Add createdAt on video
* Edit video properties (userId, userName, name, description, category, visible/unlisted/private)
* Be able to direct download a video
* Add account password
* Make the default layout on viewer
* Create new layout on viewer / video
* Use the speed rate of the viewer to render at the same speed rate

# Ideas

* Make teslausb to auto upload video to lemcam and lemcam auto merge/convert them


# Chrome cannot play tesla video since 24.4

chrome://media-internals
FFmpegDemuxer: unfixable negative timestamp.
DEMUXER_ERROR_COULD_NOT_PARSE

https://chromium.googlesource.com/chromium/src/media/+/master/filters/ffmpeg_demuxer.cc#1271

display packets
> ffprobe -i 2020-07-24_19-47-20-front.mp4 -show_packets

    [PACKET]
    codec_type=video
    stream_index=0
    pts=-650
    pts_time=-0.065000
    dts=-794
    dts_time=-0.079400
    duration=N/A
    duration_time=N/A
    convergence_duration=N/A
    convergence_duration_time=N/A
    size=57773
    pos=48
    flags=KD
    [/PACKET]
    [PACKET]
    codec_type=video
    stream_index=0
    pts=-306
    pts_time=-0.030600
    dts=-502
    dts_time=-0.050200
    duration=N/A
    duration_time=N/A
    convergence_duration=N/A
    convergence_duration_time=N/A
    size=13737
    pos=57821
    flags=__
    [/PACKET]
    [PACKET]
    codec_type=video
    stream_index=0
    pts=0
    pts_time=0.000000
    dts=-174
    dts_time=-0.017400
    duration=N/A
    duration_time=N/A
    convergence_duration=N/A
    convergence_duration_time=N/A
    size=16255
    pos=71558
    flags=__
    [/PACKET]


ffmpeg: mov_update_dts_shift() in mov.c shift the dts to avoid negative dts

display info on the shift and parsing the video
> ffprobe -v trace -i 2020-07-24_19-47-20-front.mp4