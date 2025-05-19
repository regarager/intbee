# Online Ranked Integration Bee

## Project Structure

The project consists of the following main folders:

- `client`: contains source code for each of the pages in public
- `components`: contains `.ejs` components
- `pages`: contains all `.ejs` files for each route
- `public`: contains static content (CSS, SVGs)
- `server`: contains source code for the server
- `util`: utility functions for client and server

## Environment Variables

The project has the following environment variables (may be set in `.env`):

- `JWT_SECRET`: a hex string that is used for JWT signing (recommended 64 bytes)
- `MONGO_URL`: the url of the MongoDB instance
- `PORT` (optional): the port that the server runs on, defaults to 3000

## Development

To run the project, first clone this repository. Then, run `npm install` to install dependencies.

For running in development, use `npm run dev`.

For running in production mode, run `npm run build && npm start`.
