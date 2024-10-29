# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## description

Searching for existing measurement files and creating new ones for new orders.
Built using React and Electron to allow opening and creating files locally.

### Description of the work

First, I created a React application and added Electron to it. I connected Electron.js and App.js using preload.js. Once the code was ready, I ran 
´´´bash
npm run build

For testing, I could then run 
´´´bash
npm run electron

After that, I bundled everything using 
´´´bash
npx electron-builder

The application will appear in the dist folder. If someone is going to use this, please note that the paths are hard-coded in the code.