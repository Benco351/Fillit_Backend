# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20 AS builder

# Where your source lives
WORKDIR /usr/src/app

# Copy only manifest(s) so we get CI cache on deps install
COPY package.json package-lock.json tsconfig.json eslint.config.cjs Procfile ./

# Install everything (including devDeps)
RUN npm ci

# Bring in the rest of your code
COPY . .

RUN npm run build


# ─── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only runtime deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Pull built JS from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose whatever port your app listens on
EXPOSE 8000

# Launch your compiled server
CMD ["node", "dist/server.js"]
