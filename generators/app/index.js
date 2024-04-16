'use strict';
const BaseGenerator = require('../../lib/nammaBaseGenerator')
const chalk = require("chalk");
const fs = require("fs");
const { validateNamespace, getRepositoryUrl, optionalValidateUrl } = require('../../lib/utils');
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
    this.greet(`Hi ${chalk.hex('#FFA500').bold(this.user.git.name())}! Welcome to the ${chalk.hex('#FFA500').underline('mvprockets')} ${chalk.red('namma')} generator!`);

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

      prompts.push(
        {
          type: 'input',
          name: 'repoUrl',
          message: 'What is the project git repository url?',
          validate: optionalValidateUrl,
          default: getRepositoryUrl(this.appname)
        },
      );
    }

    if (!this.targetExists("infra")) {
      prompts[1].choices.push(
        {
          name: 'Terraform Infrastructure Code',
          disabled: '(Not available)',
          value: 'infra'
        }
      );  
    }

    if (!this.targetExists("performance")) {
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

    if (this.nammaInfo.initProject) {
      let files = ['.editorconfig', '.gitignore', '.nvmrc', 'bitbucket-pipelines.yml', 'api_buildspec.yaml', 'services.json'];
      files.forEach((file, i) => {
        this.copy(
          "init/" + file,
          file
        );
      });

      let services = this.readDestinationJSON('services.json');
      services.projectName = this.answers.projectName;
      this.writeJSON('services.json', services);

      this.copy('generators', '', {globOptions: {dot: true}});
    }
  }

  writing() {
  }
  
  conflicts() {

  }
  
  install() {
  }

  async end() {
    if (!this.nammaInfo.isRepo || !this.targetExists(".git")) {
      this.log("No git repo found. Initializing git repository")
      await this.initGit();
    }
  }
};
