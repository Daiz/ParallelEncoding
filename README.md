# ParallelEncoding

A node.js module / command-line utility for doing parallel encoding with x264/ffmpeg and Avisynth. Heavily work-in-progress. Package.json for `npm install`ing dependencies coming soon, along with an actual command line interface (and thus no hardcoded input/output values).

## Dependencies

This script relies heavily on external programs that should be available in your PATH. The only thing that is absolutely required is `avsinfo`. Beyond that, you'll probably want to have at least some of the following:

- For input: avs2yuv / avs2pipe / avs2pipemod
- For encoding: x264 / x264-10bit / ffmpeg
- For muxing (eventually): mkvmerge (from mkvtoolnix)

While the script itself doesn't use any platform-specific modules, you'll need Wine for running Avisynth on non-Windows platforms.