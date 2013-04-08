# ParallelEncoding.js

A node.js module & command-line utility for doing parallel encoding with x264/ffmpeg and Avisynth. Heavily work-in-progress. To install:

1. Clone the repository with `git clone https://github.com/Daiz-/ParallelEncoding.git`
2. Navigate into the directory where you cloned the repository
3. Install the script globally with `npm install -g .`

The script will be added to the package repository later on. Global installation makes the `encode` command available. Run `encode --help` for info on how to use it.

## Dependencies

This script relies heavily on external programs that should be available in your PATH. The only thing that is absolutely required is `avsinfo`. Beyond that, you'll probably want to have at least some of the following:

- For input: avs2yuv / avs2pipe / avs2pipemod
- For encoding: x264 / x264-10bit / ffmpeg
- For muxing (eventually): mkvmerge (from mkvtoolnix)

While the script itself doesn't use any platform-specific modules, you'll need Wine for running Avisynth on non-Windows platforms.