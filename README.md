# Banter; the ultimate podcasting platform

![A demo reel of Banter](https://github.com/user-attachments/assets/2c5a2b69-d01f-45af-a0ab-1491391dd97b)

- [Get Started](#get-started)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
  - [OAuth Flow](#oauth-flow)
  - [Routes](#routes)
  - [Models](#models)
- [Frontend](#frontend)
  - [Styles](#styles)
  - [JavaScript Components](#javascript-components)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Episodes](#episodes)
  - [Podcasts](#podcasts)

## Get Started

```shell
git clone git@github.com:aadv1k/banter
cd banter/
npm install
npm run build # npm run dev
```

## Tech stack

The app is loosely based around the [MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC) Architecutre, and the `/dashboard` is a SPA rendered via [preact](https://preactjs.com/). Everything from the _oAuth (spofity, microsoft)_, to _MongoDB queries_ is implemented from _scratch_.

### Backend

```json
"dependencies": {
  "cloudinary": "^1.35.0",
  "dotenv": "^16.0.3",
  "ejs": "^3.1.8",
  "formidable": "^2.1.1",
  "mongodb": "^5.0.1",
  "node-fetch-commonjs": "^3.2.4",
  "rss": "^1.2.2",
  "uuid": "^9.0.0"
},
```

- NodeJS (node-http)
- MongoDB (Profile, Podcasts, Episodes)
- Cloudinary (Audio, Image storage)
- SASS
- Preact

## Architecture Overview

```
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                      34            436              7           2423
SCSS                             8            220              2           1135
CSS                              1             29              0           1117
EJS                              5             38              0            252
Markdown                         1             49              0            181
-------------------------------------------------------------------------------
SUM:                            49            772              9           5108
-------------------------------------------------------------------------------
```

### OAuth

Here is the oAuth flow for the APP

- Check if user is already logged in via a sessionID
- If user is logged in, redirect to `/dashboard`
- If user is not logged in redirect them to [SITE FOR AUTH TOKEN] for oAuth
- The oAuth site redirects the user back to `/[AUTH]/[SITE]/callback`
- After the OAuth redirect, if the user exists (found by their email) a new sessionID is set and the user is redirected to `/dashboard`
- If the user doesn't exist a request is sent to [SITE WITH USER INFO BY ACCESS TOKEN] and data is used to create a new user (along with a random password) and they are redirected to `/dashboard`

oAuth is implemented for ![Microsoft](https://img.shields.io/badge/Microsoft-00a4ef?style=plastic&logo=microsoft&logoColor=white)and ![Spotify](https://img.shields.io/badge/Spotify-1ED760?&style=plastic&logo=spotify&logoColor=white)

- `./routes/AuthMicrosoft.js`
- `./routes/AuthSpotify.js`

### Routes

Each file within the `./routes/` directory returns a function which consumes a node-http `Request` and `Response` object.

### Models

- `./models/BucketStore.js`: Exports a class which contains functions to push local files to a bucket like [Cloudinary](https://cloudinary.com)
- `./models/UserModel.js`: Has functions for user creation, deletion, and updating.
- `./models/MemoryStore.js`: utilify used to store and modify sessionIDs in a global store object

Here is what a user object looks like looks like

```json
{
  _id: ObjectID(),
  name: String,
  email: String,
  password: MD5(String),
  profileImage: String,
  podcasts: Array[]
}

```

## Frontend

### Styles

For the Front-End ![SASS](https://img.shields.io/badge/Sass-CC6699?style=plastic&logo=sass&logoColor=white) is used.
The `./scss/` folder is structured like so

- `_variables.scss`: Variables for rest of the styles
- `components/`
  - `_btn.scss`: The styles for the button
  - `_editor.scss`: Style for the editor elements in `/dashboard/share`
  - `_form.scss`: Style for the forms in the modals and the login page
  - `_index.scss`: fowarding
  - `_modal.scss`: Style for the modals
  - `_toast.scss`: Style for the Toast component
- `index.scss`

### JavaScript Components

A large part of the frontend is handled by ![Preact](https://img.shields.io/badge/Preact-20232A?style=plastic&logo=react&logoColor=61DAFB) which is a minified version of the actual React and is pulled as a CDN.  
When the user accesses `/dashboard`, the server responds with static html, the static html links to a index file, after which point all the dynamic UI of the app is handled as a SPA here is the overview of `./public/js/` Folder

- `App.js`: Exports a single `<App />` component that ties in with the html `dashboard.ejs`
- `Modal.js`: Exports a `<Modal />` component
- `ModalEpisode.js`: Exports a `<ModalEpisode />` component which is used to edit/create a new episode
- `ModalPodcast.js`: Exports a `<ModalPodcast />` component which is used to edit/create a new podcast
- `PageCreate.js`: Component that is routed by `/dashboard/create/` is also the default route
- `PageManage.js`: Component that is routed by `/dashboard/manage/`
- `PageShare.js`: Component that is routed by `/dashboard/share/`
- `Toast.js`: Component that exports a `Toast` function which uses a `.toast` for styles
- `index.js`: Component linked to `dashboard.ejs`


## API Reference

### `/login`

- Method: `POST`
- Fields
  - `email`
  - `password`

#### Success

- Code: `302`
- Redirect: `/dashboard`
- Set-Cookie: `sessionid=`

#### Errors

- `badInput` - `400`: the provided input was invalid
- `userNotFound` - `404`: the given user is not registered
- `invalidPassword` - `401`: the password given for the user is invalid
- `invalidMethod` - `405`: method invalid for requested resource

### `/signup`

- Method: `POST`
- Fields
  - `email`
  - `password`
  - `name`

#### Success

- Code: `302`
- Redirect: `/dashboard`
- Set-Cookie: `sessionid=`

#### Errors

- `bad-input` - `400`: the provided input was invalid
- `user-exists` - `400`: the user is already registered
- `invalid-method` - `405`: method invalid for requested resource

### `/getEpisode`

- Method: `GET `
- Cookie: `sessionid`
- Fields
  - `podcastID`
  - `episodeID` OPTIONAL

#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist
- `invalid-episode-id` - `404`: the episode ID provided does not exist

### `/createEpisode`

- Method: `POST`
- Cookie: `sessionid`
- Fields
  - `audio`: an audio file
  - `title`
  - `number`
  - `podcastID`
  - `description`


#### Errors

- `bad-input` - `400`: the provided input was invalid
- `invalid-audio-file-format` - `400`: the provided file format for the cover was invalid
- `exceeds-audio-size-limit` - `400`: the provided image exeeds the image size limit of a 10 Megabytes
- `unable-to-find-user` - `400`: was unable to find the provided sessionID or user
- `unauthorized` - `401`: you don't have the credentials to access this resource
- `internal-err` - `500`: something went wrong on the server
- `invalid-episode-id` - `404`: the episode ID provided does not exist

### `/updateEpisode`

- Method: `PUT`
- Cookie: `sessionid`
- Fields
  - `podcastID`
  - `episodeID`
  - Any valid parameter for `/createEpisode`


#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist
- `invalid-episode-id` - `404`: the episode ID provided does not exist

### `/deleteEpisode`

- Method: `DELETE`
- Cookie: `sessionid`
- Fields
  - `podcastID`
  - `episodeID`


#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist
- `invalid-episode-id` - `404`: the episode ID provided does not exist

### `/getPodcast`

- Method: `GET `
- Cookie: `sessionid`
- Fields
  - `podcastID`


#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist

### `/createPodcast`

- Method: `POST`
- Cookie: `sessionid`
- Fields
  - `cover`: a image file for podcast cover
  - `title`
  - `explicit`
  - `description`
  - `category`
  - `language`


#### Errors

- `bad-input` - `400`: the provided input was invalid
- `invalid-image-file-format` - `400`: the provided file format for the cover was invalid
- `exceeds-imageh-size-limit` - `400`: the provided image exeeds the image size limit of a 10 Megabytes
- `unable-to-find-user` - `400`: was unable to find the provided sessionID or user
- `unauthorized` - `401`: you don't have the credentials to access this resource
- `internal-err` - `500`: something went wrong on the server
- `invalid-episode-id` - `404`: the episode ID provided does not exist

### `/updatePodcast`

- Method: `PUT`
- Cookie: `sessionid`
- Fields
  - `podcastID`
  - Any valid parameter for `/createPodcast`

#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist

### `/deletePodcast`

- Method: `DELETE`
- Cookie: `sessionid`
- Fields
  - `podcastID`

#### Errors

- `unauthorized` - `401`: you don't have the credentials to access this resource
- `invalid-podcast-id` - `404`: the podcast ID provided does not exist

