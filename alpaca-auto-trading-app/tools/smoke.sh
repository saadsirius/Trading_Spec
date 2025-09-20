#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-http://localhost:3000}"

echo "🔎 Smoke: $HOST/"
curl -s -o /dev/null -w "  % {http_code} %{time_total}s\n" "$HOST/"

echo "🔎 Smoke: $HOST/symbol/AAPL"
curl -s -o /dev/null -w "  % {http_code} %{time_total}s\n" "$HOST/symbol/AAPL"

echo "🔎 Smoke: $HOST/item/123"
curl -s -o /dev/null -w "  % {http_code} %{time_total}s\n" "$HOST/item/123"

echo "Done."
