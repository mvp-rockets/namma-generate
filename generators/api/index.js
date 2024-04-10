const BaseGenerator = require('../../lib/nammaBaseGenerator')
const { validateNamespace } = require('../../lib/utils');
 
module.exports = class extends BaseGenerator {

  rootGeneratorName() {
    return 'NammaApiGenerator';
  }

  async prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'serviceName',
        message: 'What is the api service name?',
        validate: validateNamespace,
        default: "api" 
      },
      {
        type: 'rawlist',
        name: 'cloudProvider',
        message: 'Which cloud provider are we deploying it to?',
        validate(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one cloud provider.';
          }
      
          return true;
        },
        choices: [
          { name: 'AWS', value: 'aws' },
          { name: 'Google Cloud', value: 'gcp' },
          { name: 'Other', value: 'other' },
          { name: 'Azure (NA)', value: 'azure', disabled: true },
        ]
      }
    ];

    this.answers = await this.prompt(prompts);
  }

  writing() {
    console.log("Destination: ", this.destinationRoot());
    console.log("Source: ", this.sourceRoot());
    console.log("ServiceName: ", this.answers.serviceName, this.answers);
  }
};
