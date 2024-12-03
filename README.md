## Project Requirements

`node 20.12.0`
`npm 10.5.0`
`react-native 0.76.3`
`react ^18`
`expo ~52.0.11`
`expo-sqlite ~15.0.3`
`@aws-sdk/client-s3 3.574.0`

## Overview
Photo Gallery App is a React Native application built with Expo and TypeScript, designed to simplify photo management. Users can capture photos, add captions, and view them in list or grid modes. The app supports offline storage with SQLite and uploads photos to S3 bucket for secure cloud storage. It offers a responsive and user-friendly interface for seamless photo management.

## Installation

**Clone the repository**
 ```bash
git clone https://github.com/Domior/photo-gallery-app.git
cd photo-gallery-app
```
**Install dependencies**
```bash
npm install
```
**Set up environment variables**\
Create a `.env.local` file based on `.env.example` and configure your AWS keys and other environment variables.

**Start the app**
   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo



