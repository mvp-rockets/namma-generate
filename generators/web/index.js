const BaseGenerator = require('../../lib/nammaBaseGenerator')
const { validateNamespace } = require('../../lib/utils');

module.exports = class extends BaseGenerator {

  rootGeneratorName() {
    return 'NammaWebGenerator';
  }

  async prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'serviceName',
        message: 'What is the Next.js service name?',
        validate: validateNamespace,
        default: "web" 
      },
    ];

    this.answers = await this.prompt(prompts);
  }

  writing() {
    console.log("Destination: ", this.destinationRoot());
    console.log("Source: ", this.sourceRoot());
    console.log("ServiceName: ", this.answers);
  }
};
