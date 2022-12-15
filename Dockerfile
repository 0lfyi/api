FROM node:18.12.1

ENV TZ=UTC

RUN set -ex; \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime; \
    echo $TZ > /etc/timezone;

RUN npm install -g npm

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY ./ ./

ENV NODE_ENV=production

RUN npm run prisma-generate

ENV ROLES=api

ENV PORT 8080
EXPOSE 8080


CMD ["npm", "run", "serve"]
