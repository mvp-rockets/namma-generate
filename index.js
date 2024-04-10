#!/usr/bin/env node
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import nammaGenerator from './generators/app/index.js';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const yeoman = require('yeoman-environment');
const { dirname, join } = require('path');
const nammaGenerator = require('./generators/app/index.js');

async function init() {

  // const {createEnv} = await import('yeoman-environment');
  // const env = createEnv();
  const env = yeoman.createEnv();

  env.registerStub(nammaGenerator, 'mvprockets:app', join(__dirname, '/generators/app/index.js'));

  //env.registerGeneratorPath(join(__dirname, '/generators/app/index.js'), 'mvprockets:app')
  console.log("Script directory :", join(__dirname, '/generators/app/index.js'));
  console.log("Current directory:", process.cwd());
  env.run('mvprockets:app');
  // Or passing arguments and options
  //env.run('npm:app some-name', { 'skip-install': true }, done);
}

init();
