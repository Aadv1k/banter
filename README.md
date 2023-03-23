# Banter; the ultimate podcasting platform

## Get

```shell
git clone git@github.com:aadv1k/banter
cd banter/
npm install
npm run build # npm run dev
```

## Tech stack

The app is loosely based around the [MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC) Architecutre, and the `/dashboard` is a SPA rendered via [preact](https://preactjs.com/). Everything from the *oAuth (spofity, microsoft)*, to *MongoDB queries* is implemented from *scratch*.

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

## Frontend

- SASS 
- Preact
- Gulp


## Codebase

```
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                      34            442              7           2195
SCSS                             8            235              2           1123
EJS                              5             45             22            248
Markdown                         1              5              0             13
-------------------------------------------------------------------------------
SUM:                            48            727             31           3579
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

Here are all the possible *error* responses that can be returned by the app

```js
{
  badInput: {
    error: "bad-input",
    message: "the provided input was invalid",
    code: 400,
  },

  episodeLimitExceeded: {
    error: "episode-limit-exceeded",
    message: "the given user has exceeded their limit for new episodes",
    code: 400,
  },

  podcastLimitExceeded: {
    error: "podcast-limit-exceeded",
    message: "the given user has exceeded their limit for new podcasts",
    code: 400,
  },

  invalidEpisodeID: {
    error: "invalid-episode-id",
    message: "the episode ID provided does not exist",
    code: 404,
  },

  invalidPodcastID: {
    error: "invalid-podcast-id",
    message: "the podcast ID provided does not exist",
    code: 404,
  },

  invalidMethod: {
    error: "invalid-method",
    message: "method invalid for requested resource",
    code: 405,
  },

  unableToFindUser: {
    error: "unable-to-find-user",
    message: "was unable to find the provided sessionID or user",
    code: 400,
  },

  unauthorized: {
    error: "unauthorized",
    message: "you don't have the credentials to access this resource",
    code: 401,
  },

  userExists: {
    error: "user-exists",
    message: "the user is already registered",
    code: 400,
  },

  userNotFound: {
    error: "user-not-found",
    message: "the given user is not registered",
    code: 404,
  },

  internalErr: {
    error: "internal-error",
    message: "something went wrong on the server",
    code: 500,
  },


  invalidImageFileFormat: {
    error: "invalid-image-file-format",
    message: "the provided file format for the cover was invalid",
    code: 400,
  },

  invalidAudioFileFormat: {
    error: "invalid-audio-file-format",
    message: "the provided file format for episode was invalid",
    code: 400,
  },

  exceedsAudioSizeLimit: {
    error: "exceeds-audio-size-limit",
    message: "the provided data exeeds the audio size limit of a 100 Megabytes",
    code: 400,
  },

  exceedsImageSizeLimit: {
    error: "exceeds-imageh-size-limit",
    message: "the provided image exeeds the image size limit of a 10 Megabytes",
    code: 400,
  },


  invalidPassword: {
    error: "invalid-password",
    message: "the password given for the user is invalid",
    code: 401,
  },
},
```


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

### Frontend

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

### JavaScript

A large part of the frontend is handled by ![Preact](https://img.shields.io/badge/Preact-20232A?style=plastic&logo=react&logoColor=61DAFB ) which is a minified version of the actual React and is pulled as a CDN.  
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
