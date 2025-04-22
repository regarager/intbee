# Online Ranked Integration Bee

## Project Structure

The project consists of three main folders: `client`, `public`, and `server`.

- `public`: contains static content (HTML, CSS)
- `client`: contains source code for each of the pages in public
- `server`: contains source code for the server

## Environment Variables

The project has the following environment variables (may be set in `.env`):
- `PORT` (optional): the port that the server runs on, defaults to 3000
- `MONGO_URL`: the url of the MongoDB instance
- `JWT_SECRET`: a hex string that is used for JWT signing (recommended 64 bytes)

## Development

To run the project, first clone this repository. Then, run `npm install` to install dependencies.

For running in development, use `npm run dev`.

For running in production mode, run `npm run build && npm start`.
