#!/usr/bin/env bash
set -euo pipefail
npm ci --omit=dev
npm run prisma:generate:mysql
node scripts/migrate-deploy.cjs mysql
