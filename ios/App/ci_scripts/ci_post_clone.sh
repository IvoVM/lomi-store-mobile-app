#!/usr/bin/env bash

set -x

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
# have to add node yourself link to this issue https://stackoverflow.com/questions/73462672/xcode-cloud-suddenly-failing-to-link-node-and-install-dependencies
brew update
brew install node

# or `npm ci` or `yarn install --frozen-lockfile`
npm install --force
npm run build
# or npm run build
npx ionic cap sync ios 