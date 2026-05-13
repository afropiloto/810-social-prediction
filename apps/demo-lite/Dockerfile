FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
ARG VITE_PRIVY_APP_ID
ENV VITE_PRIVY_APP_ID=$VITE_PRIVY_APP_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app ./
EXPOSE 8080
CMD ["npm","run","start"]

