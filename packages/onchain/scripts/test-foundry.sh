#!/usr/bin/env bash
set -euo pipefail

# Runs forge tests in a container so local/CI doesn't need Foundry installed.
docker build -f Dockerfile.foundry -t 810-onchain-foundry-test .
docker run --rm 810-onchain-foundry-test

