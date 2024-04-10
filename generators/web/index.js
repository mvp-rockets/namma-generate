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
    this.copy(
      '**',
      this.answers.serviceName + "/",
      { globOptions: { dot: true, ignore: ['.git'] } }
    );
  }
};
