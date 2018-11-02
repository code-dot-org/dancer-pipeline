[![Build Status](https://travis-ci.org/code-dot-org/dancer-pipeline.svg?branch=master)](https://travis-ci.org/code-dot-org/dancer-pipeline)

Uses [lottie](https://github.com/airbnb/lottie-web) and [svgo](https://github.com/svg/svgo) to convert After Effects animations exported to JSON back into optimized SVG frames for dance party.

## Get started:

You should be using node >= 8.0.

```sh
# Set up
npm install
npm run start-server

# Turn .json files into optimized SVGs
./index.js

# Preview optimized SVGs
./index.js preview --speed=2

# Clean up
npm run stop-server
```

## To-Do

- Get Travis to commit or upload results automatically
