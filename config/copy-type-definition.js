#!/usr/bin/env node

const shell = require('shelljs');
shell.cp('-R', './package/index.d.ts', './dist/index.d.ts');
