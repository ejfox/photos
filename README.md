# Nuxt + Cloudinary Photo Gallery App

This README document describes the development of a custom media organizing and publishing application using bash scripts, Apple Automator, and Cloudinary on a Nuxt.js framework.

## What is this project about?

This project arose from the author's need for a better way to organize and publish media files. Frustrated with existing solutions, a unique process of organizing and publishing photos using existing tools and some custom scripting was developed. The project focuses on an organized file system that starts with the `~/dump/` directory where all new media is initially saved and subsequently moved to organized directories in `~/media/` and finally uploaded to Cloudinary.

## The Project Process:

1. **Import SD Card to `~/dump/`**: Apple Automator and bash scripting are used to handle the importation of files from SD cards into the `~/dump/` directory. Only specific file types (JPEG, MP3, MP4, RAF, WAV) are selected for copying.
2. **Organize `~/dump/` into `~/media/`:** When `~/dump/` grows too large, another script is run which moves everything in `~/dump/` into organized sub-folders in `~/media/`, based on their creation date and file type. Log files of the operations are created and stored in the same directory.
3. **Upload to Cloudinary:** After the local organization is completed, the media files tagged in green are uploaded to Cloudinary using a bash script that detects the tags, navigates to the correct directory, and executes the upload command.

## Web Interface with Nuxt.js:

The files stored on Cloudinary are fetched back for viewing on a web interface built with Nuxt.js. Server-side coding is implemented to securely access Cloudinary with private keys and retrieve the media. It also features a Nuxt Server API which fetches the latest photos when the endpoint `/api/latest-photos` is accessed. 

Overall, this is a fully functional and efficient media organizing system that follows the author's personalized approach to manage a large collection of files and present them in an organized and pleasant web gallery built on Nuxt.js.

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# yarn
yarn build
```

Locally preview production build:

```bash
# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## API Endpoints

### `/api/cloudinary-lite-info`

This endpoint retrieves lite information about all photos stored in Cloudinary.

#### Request Method:
- `GET`

#### Response:
The response will be a JSON array containing objects with the following fields for each photo:
- `public_id`: The unique identifier for the photo in Cloudinary.
- `secure_url`: The secure URL to access the photo.
- `created_at`: The date and time when the photo was uploaded.

#### Example Response:
```json
[
  {
    "public_id": "sample_photo_1",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v123456/sample_photo_1.jpg",
    "created_at": "2023-01-01T12:00:00Z"
  },
  {
    "public_id": "sample_photo_2",
    "secure_url": "https://res.cloudinary.com/demo/image/upload/v123456/sample_photo_2.jpg",
    "created_at": "2023-01-02T12:00:00Z"
  }
]
```

This endpoint is useful for fetching a summary of all photos for analytics, such as totals, counts, and grouping by month stats.
