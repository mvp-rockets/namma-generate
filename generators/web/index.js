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

  async writing() {
    this.copy(
      '**',
      this.answers.serviceName + "/",
      { globOptions: { dot: true, ignore: ['**/\.git'] } }
    );

    // Update package.json
    let pkgJson = this.readTemplateJSON('package.json');
    pkgJson.name = `${this.options.nammaInfo.projectName}-${this.answers.serviceName}`;
    pkgJson.version = "1.0.0";
    this.writeJSON(`${this.answers.serviceName}/package.json`, pkgJson);

    // Update services.json
    let service = {"type": "web", "name": this.answers.serviceName, "sub_services": []}
    this.saveServicesJson(service);
  }

  async install() {

    var options = {
      cwd: './' + this.answers.serviceName
    };

    this.npmInstall(null, null, options);
  }

};
