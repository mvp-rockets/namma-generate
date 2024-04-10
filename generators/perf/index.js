const BaseGenerator = require('../../lib/nammaBaseGenerator')
 
module.exports = class extends BaseGenerator {

  rootGeneratorName() {
    return 'NammaPerfGenerator';
  }

  async prompting() {
  }

  writing() {
    console.log("Destination: ", this.destinationRoot());
    console.log("Source: ", this.sourceRoot());
  }
};
