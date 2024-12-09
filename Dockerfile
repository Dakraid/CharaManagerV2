ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-slim AS base

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /src

# Run
FROM base

ENV PORT=$PORT

COPY ./.output /src/.output
COPY ./package.json /src/package.json
COPY ./package-lock.json /src/package-lock.json

RUN mkdir /src/temp
RUN mkdir /src/logs
RUN npx playwright install --with-deps chromium

CMD [ "node", ".output/server/index.mjs" ]
