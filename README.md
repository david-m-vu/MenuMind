# MenuMind
A CS160 project

## Dev notes
To get started:
- make sure you're on Node 25
- copy the .env.example files into new .env files for both /client and /server
- fill out the environment variables in the .envs
    - for /client/.env, you'll need your own Google Maps API key and Map ID
        - https://developers.google.com/maps
    - for /server/.env, you'll need to grab the Rea.gent API key from the team noggin and you'll also need your own Foursquare API key
        - https://rea.gent/noggins/soviet-pony-3508/edit
        - https://foursquare.com/developers/home

Once you have all the environment variables filled out, in one terminal:
```
cd client
npm install
npm run dev
```
In another terminal:
```
cd server
npm install
nodemon index.js
```