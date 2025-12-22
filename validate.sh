#!/bin/zsh
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print() {
    local color=$1 msg=$2
    case $color in
        red) echo "${RED}${msg}${NC}" ;;
        green) echo "${GREEN}${msg}${NC}" ;;
        yellow) echo "${YELLOW}${msg}${NC}" ;;
    esac
}

run_step() {
    local name=$1 cmd=$2
    print yellow "▶ $name..."
    if eval "$cmd"; then
        print green "✓ $name"
    else
        print red "✗ $name failed"
        exit 1
    fi
}

# Main
START=$(date +%s)

echo "🎯 Validating mertyas.in"
echo ""

run_step "Install" "pnpm install --silent"
run_step "Lint" "ESLINT_USE_FLAT_CONFIG=false pnpm exec eslint . --ext ts,tsx"
run_step "Type check" "pnpm exec tsc --noEmit"
run_step "Build" "pnpm build"

ELAPSED=$(($(date +%s) - START))
echo ""
print green "✅ Done (${ELAPSED}s)"
