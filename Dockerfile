FROM node:18-buster as build

WORKDIR /app
COPY package*.json ./
RUN rm -rf .dist
RUN rm -rf node_modules

COPY . .
RUN npm install --legacy-peer-deps
RUN npx tsc

FROM node:18-alpine as run
WORKDIR /app
COPY --from=build /app/package.json ./package.json

COPY --from=build /app/build ./build
COPY --from=build /app/src/schema.json ./build/

RUN npm install --omit=dev 
RUN npm prune --production

ENTRYPOINT ["node", "build/panel_script.js", "/config/config.json"]
