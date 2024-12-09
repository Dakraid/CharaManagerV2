# CharaManagerV2

CharaManager is a web application made to manage and maintain your collection of TavernV2 cards (used by SillyTavern, ChubAi, JanitorAi, and more)

## Features

- Upload and parsing of character cards
- Multi file upload
- Direct download from VenusAi and JannyAi
- Embedding-based duplicate detection
- Multi functional search including description search using embeddings
- Automatic conversion of v1 to v2 card specification
- Character card editor
    - Allows editing of all fields except embedded lorebooks, latter coming soon
- Automatic hierarchy and relation detection using name and string distance matching
- Comparison of definition content between related cards using a full diff editor
- Statistics for cards, including characters per author, token count, cards uploaded per day

### Know Issues

- Relation display is broken
    - Known issue, currently in progress
- Not all features are mobile-ready
    - This is in parts by design, as some functionality simply doesn't work well on small screens i.e. Relations or Statistics

### Upcoming Integrations

- Updated search dialog with better filters
- Replacing of character images and cropping
- Lorebook Editing
- SillyTavern Synchronization

## Dependencies

CharaManagerV2 requires multiple elements to work properly:

- Postgres database with [pgvector](https://github.com/pgvector/pgvector) enabled
- Embedding provider, I recommend [NomicAI](https://atlas.nomic.ai)

Optional dependencies:

- S3 (or S3 compatible) storage provider
- 2Captcha key

## Running from Source

### Setup

Make sure to install the dependencies:

```bash
npm install
npx playwright install --with-deps
```

### Database Setup

In the root folder of the project, create a file named `drizzle.config.ts`, and enter following adjusted for your connection:

```TS
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './utils/drizzle',
    schema: './utils/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: 'host',
        user: 'user',
        password: 'password',
        database: 'database',
        ssl: 'allow',
    },
    verbose: true,
});
```

Afterward run `npx drizzle-kit migrate`

### Settings

Copy the included `.env.sample` to `.env` and adjust the contents as needed.

```bash
npm dev
```

### Development Server

Start the development server on (default) `http://localhost:3000`:

```bash
npm dev
```

### Production

Build the application for production:

```bash
npm build
```

Locally preview production build:

```bash
npm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# License

This project is licensed under AGPLv3.0
The license text for the AGPLv3.0 can be found here: [AGPLv3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

The following clause applies on top of it and overrides any conflicting clauses:
**This project may not be used in a commercial context under any circumstance unless a commercial license has been granted by the owner. This stipulation applies on top of the
AGPLv3 license.**

# Credits

This project is build using VueJS, NuxtJS, and Shadcn-Vue (and more).

Thanks to Cohee and the other SillyTavern developers for helping me with parsing the data from the PNGs.

Many thanks to the nice people over at the SillyTavern Discord for providing feedback and guidance. Especially Cohee, Wolfsblvt, Nyx, and others!
