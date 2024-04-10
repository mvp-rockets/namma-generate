'use strict';
// import Generator from 'yeoman-generator';
// import chalk from 'chalk';
// import yosay from 'yosay';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
const BaseGenerator = require('../../lib/nammaBaseGenerator')
const chalk = require("chalk");
const fs = require("fs");
const { validateNamespace } = require('../../lib/utils');

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

module.exports = class extends BaseGenerator {
  
  rootGeneratorName() {
    return 'NammaGenerator';
  }

  async initializing() {
    await super.initializing();

    if (fs.existsSync(this.destinationPath("services.json"))) {
      this.nammaInfo.services = JSON.parse(fs.readFileSync(this.destinationPath("services.json"), 'utf8'));
    }
    else {
      this.nammaInfo.initProject = true;
    }
  }

  async prompting() {
    // Have Yeoman greet the user.
    this.greet(`Welcome to the ${chalk.hex('#FFA500').underline('mvprockets')} ${chalk.red('namma')} generator!`);

    const prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the project name?',
        validate: validateNamespace,
        default: this.appname
      },
      {
        type: 'checkbox',
        message: 'Which all services you want to setup?',
        name: 'serviceType',
        choices: [
          {
            name: 'Namma API Service',
            value: 'api'
          },
          {
            name: 'Next.js Web Site',
            value: 'web'
          },
          {
            name: 'Nuxt.js API Service',
            value: 'nuxt',
            disabled: '(WIP)'
          },
        ],
        validate(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one service.';
          }
      
          return true;
        },
      },      
    ];
    if (this.nammaInfo.initProject) {
      prompts[1].choices.push(
        {
          name: 'Deployment Scripts',
          checked: true,
          value: 'scripts'
        },
        {
          name: 'Project Init Files',
          checked: true,
          value: 'init'
        },
      );
    }

    if (!this.destinationExists("infra")) {
      prompts[1].choices.push(
        {
          name: 'Terraform Infrastructure Code',
          disabled: '(Not available)',
          value: 'infra'
        }
      );  
    }

    if (!this.destinationExists("performance")) {
      prompts[1].choices.push(
        {
          name: 'K6 Performance Scripts',
          disabled: '(Not available)',
          value: 'perf'
        }
      );  
    }

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.answers = props;
      this.nammaInfo = Object.assign(this.nammaInfo, this.answers);
    });
  }
  
  async configuring() {

    for (let service of this.answers.serviceType) {
      if (service == "init") continue;
      this.composeWithLocal(
        "../generators/" + service + "/index.js", 
        "nammaGenerator:" + service, 
        { nammaInfo: this.nammaInfo }
      );  
    }
  }

  writing() {
    // this.fs.copyTpl(
    //   this.templatePath('dummyfile.txt'),
    //   this.destinationPath('dummyfile.txt'),
    //   { title: 'Templating with Yeoman' }
    // );
  }
  
  conflicts() {

  }

  // path() {
  //   console.log("Destination: ", this.destinationRoot());
  //   console.log(this.destinationPath("script/example-file.txt"));
  //   console.log("Context root", this.contextRoot);
  //   console.log("Source: ", this.sourceRoot());
  //   console.log("Path", this.templatePath('index.js'));
  // }
  
  install() {
    //this.installDependencies();
    console.log("Install");
  }

  end() {
    console.log("Cleanup");
  }
};

// See code e.g.
// https://github.com/danger/generator-danger-plugin/blob/master/src/app/index.js
// https://github.com/yeoman/generator-generator/blob/main/app/index.js
// https://github.com/yeoman/generator-node
// https://github.com/yeoman/generator-node/blob/main/generators/app/index.js
// https://github.com/onebeyond/generator-systemic/blob/master/generators/app/index.js
// https://github.com/Samuel-Martineau/generator-svelte/blob/master/generators/app/index.js
