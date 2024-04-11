#!/usr/bin/env node

const yeoman = require('yeoman-environment');
const { join } = require('path');
const nammaGenerator = require('./generators/app/index.js');

async function init() {

  const env = yeoman.createEnv();

  env.registerStub(nammaGenerator, 'mvprockets:app', join(__dirname, '/generators/app/index.js'));

  env.run('mvprockets:app');
}

init();
