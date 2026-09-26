FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG APP_VARIANT=rehearsal
ARG EXPO_PUBLIC_API_URL
ARG OPERATOR_NAME
ARG SUPPORT_EMAIL
ARG LEGAL_ORIGIN
ARG HOSTING_REGION
ARG BACKUP_RETENTION_DAYS
ENV APP_VARIANT=$APP_VARIANT EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL OPERATOR_NAME=$OPERATOR_NAME SUPPORT_EMAIL=$SUPPORT_EMAIL LEGAL_ORIGIN=$LEGAL_ORIGIN HOSTING_REGION=$HOSTING_REGION BACKUP_RETENTION_DAYS=$BACKUP_RETENTION_DAYS
RUN npm run typecheck && npm run lint && npm test && npm run build:web
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8787 DB_PATH=/data/portfolio.sqlite
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/zod ./node_modules/zod
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8787/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","server/index.mjs"]
