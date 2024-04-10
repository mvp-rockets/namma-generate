'use strict';
const BaseGenerator = require('../../lib/nammaBaseGenerator')
 
module.exports = class extends BaseGenerator {
  
  rootGeneratorName() {
    return 'NammaInfraGenerator';
  }

  initializing() {
  }

  prompting() {
  }

  configuring() {
  }

  writing() {
    console.log("Destination: ", this.destinationRoot());
    console.log("Source: ", this.sourceRoot());
  }

  conflicts() {
  }

  install() {
  }

  end() {
  }
};
