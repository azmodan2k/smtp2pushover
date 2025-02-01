ARG NODE_VERSION=18.20.5
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN npm run yarn install --frozen-lockfile

COPY tsconfig.json .
COPY src src
RUN npm run yarn build && yarn install --production --frozen-lockfile
RUN cp /app/src/config/config.dist.json /app/dist/config/config.json

FROM node:${NODE_VERSION}-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app
COPY --from=build /app/package.json package.json
COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/dist ./

ENTRYPOINT [ "/sbin/tini", "--", "node", "index.js" ]