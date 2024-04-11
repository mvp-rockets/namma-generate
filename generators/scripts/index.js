const BaseGenerator = require('../../lib/nammaBaseGenerator')
 
module.exports = class extends BaseGenerator {

  rootGeneratorName() {
    return 'NammaScriptsGenerator';
  }

  async prompting() {
  }

  writing() {
    this.copy(
      '**', 
      "scripts/", 
      { globOptions: { dot: true, ignore: ['**/\.git', '**/gcp-env/*', '**/golden-key*'] } }
    );
  }
};
