#!/bin/bash
rm ./repomix-output.txt
repomix --ignore "**/*.log,tmp/,.eslintrc.cjs,tsconfig*.json,vite.config.ts,.gitignore,src/vite-env.d.ts,package.json,README.md"