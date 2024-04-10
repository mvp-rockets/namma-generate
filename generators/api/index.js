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
    const apiFilesOrFolderNotToCreate = {
      gcp: ['aws-config.js', 'gcp-config.js', 'gcp-env', 'aws-env', 'SQS',
          'queues-scripts', 'elasticmq', 'aws', 'aws-initial_api_setup.sh', 'gcp-initial_api_setup.sh',
          'aws-deploy-api.sh', 'gcp-deploy-api.sh', 'aws-api-routes.js', 'gcp-api-routes.js', 'aws-build-env-index.js', 'gcp-build-env-index.js'],
      aws: ['aws-config.js', 'gcp-config.js', 'gcp-env', 'aws-env', 'PUBSUB',
          'topics-scripts', 'gcp', 'gcp-initial_api_setup.sh', 'aws-initial_api_setup.sh',
          'aws-deploy-api.sh', 'gcp-deploy-api.sh', 'aws-api-routes.js', 'gcp-api-routes.js', 'aws-build-env-index.js', 'gcp-build-env-index.js']
    };

    this.copy(
      '**',
      this.answers.serviceName + "/",
      { globOptions: { dot: true, ignore: ['.git', ...apiFilesOrFolderNotToCreate[this.answers.cloudProvider]] } }
    );

  }

  install() {
    console.log("API Install");
  }

  end() {
    console.log("API Cleanup");
  }

};
