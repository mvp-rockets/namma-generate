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
        type: 'list',
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
    const ignoreList = {
      common: ['**/\.git', '**/*.ejs', '**/gcp-env/*', '**/aws-env/*',
        '**/aws-config.js', '**/gcp-config.js',
        '**/aws-api-routes.js', '**/gcp-api-routes.js',
        '**/aws-build-env-index.js', '**/gcp-build-env-index.js'
      ],
      gcp: ['**/sqs/**', '**/queues-scripts/**', '**/elasticmq/**', '**/aws/**'],
      aws: ['**/PUBSUB/**', '**/topics-scripts/*', '**/gcp/**']
    };

    // FIXME: Should handle multiple providers.
    this.copy(
      '**',
      this.answers.serviceName + "/",
      { globOptions: { dot: true, ignore: [...ignoreList["common"], ...ignoreList[this.answers.cloudProvider]] } }
    );
    // Generate config/config.js
    let filename = `config/${this.answers.cloudProvider}-config.js`;
    if (this.templateExists(filename)) {

      let content = {
        cloudProvider: {
          config: this.readTemplate(filename)
        }
      }

      this.copyTemplate(
        'config/config.js.ejs',
        `${this.answers.serviceName}/config/config.js`,
        content
      );
    }
    // Update api-routes.js
    this.append(
      `${this.answers.cloudProvider}-api-routes.js`,
      `${this.answers.serviceName}/api-routes.js`,
    );

    // Copy build-env-index.js
    this.copy(
      `${this.answers.cloudProvider}-build-env-index.js`,
      `${this.answers.serviceName}/build-env-index.js`,
      { append: true }
    );

    // Update package.json
    let pkgJson = this.readTemplateJSON('package.json');
    pkgJson.name = `${this.options.nammaInfo.projectName}-${this.answers.serviceName}`;
    pkgJson.version = "1.0.0";
    this.writeJSON(`${this.answers.serviceName}/package.json`, pkgJson);

    // Update services.json
    let service = {"type": "api", "name": this.answers.serviceName, "sub_services": []}
    if (this.options.nammaInfo.initProject) {
      service.primary = true;
      service.sub_services = ["cron", "sqs"];
    }
    this.saveServicesJson(service);
  }

  async install() {

    var options = {
      cwd: './' + this.answers.serviceName
    };

    this.npmInstall(null, null, options);
  }

  end() {
  }

};
