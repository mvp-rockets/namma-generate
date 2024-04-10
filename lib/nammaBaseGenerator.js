const Generator = require('yeoman-generator');
const simpleGit = require('simple-git');
const { join } = require('path');
const yosay = require('yosay');

module.exports = class extends Generator {

    get git() {
        if (!this._simpleGit) {
            this._simpleGit = simpleGit({ baseDir: this.destinationPath() }).env({
                ...process.env,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                LANG: 'en',
            });
        }

        return this._simpleGit;
    }

    async initGit() {
        try {
            await git.init();
            if (this.nammaInfo?.repoUrl) {
                await git.addRemote('origin', this.nammaInfo.repoUrl);
            }
        } catch (e) {
            console.error("Init git failed", e);
        }
    }

    async initializing() {
        this.nammaInfo = {
            initProject: false,
            isRepo: await this.git.checkIsRepo('root')
        };
    }

    /**
   * Show Yeoman's greeting
   * @param  {string} message greeting message
   * @return {Generator}         this
   */
    greet(message) {
        if (!this.options.skipGreeting) {
            this.log(yosay(message));
        }
        return this;
    }

    /**
    * Compose with a local subgenerator within the same package
    * @param  {string} subgeneratorPath relative path of the subgenerator
    * @param  {string} namespace namespace for the called generator to operate in
    * @param  {Object} options   options to pass to the generator
    * @return {Generator}           this
    */
    composeWithLocal(subgeneratorPath, namespace, options) {
        const generator = require(subgeneratorPath);
        this.composeWith({
                Generator: generator,
                namespace: namespace,
                path: join(__dirname, subgeneratorPath),
            },
            options
        );

        return this;
    }

    //---------------------------------------------------
    // file handling
    //---------------------------------------------------

    /**
     * Read template file
     * @param  {string} filePath path of the file within the template directory
     * @param  {Object} options  generator.fs.read's options. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {string}          content of the file
     */
    readTemplate(filePath, options) {
        return this.fs.read(this.templatePath(filePath), options);
    }

    /**
     * Read destination file
     * @param  {string} filePath path of the file within destination directory
     * @param  {Object} options  generator.fs.read's options. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {string}          content of the file
     */
    readDestination(filePath, options) {
        return this.fs.read(this.destinationPath(filePath), options);
    }

    /**
     * Read JSON file from template
     * @param  {string} filePath path of the file within template directory
     * @return {Object}          object parsed from the JSON file
     */
    readTemplateJSON(filePath) {
        return this.fs.readJSON(this.templatePath(filePath), {});
    }

    /**
     * Read JSON file from destination
     * @param  {string} filePath path of the file within destination directory
     * @return {Object}          object parsed from the JSON file
     */
    readDestinationJSON(filePath) {
        return this.fs.readJSON(this.destinationPath(filePath), {});
    }

    /**
     * Write to destination
     * @param  {string} filePath path of the file within destination directory
     * @param  {string} contents content to write
     * @return {Generator}          this
     */
    write(filePath, contents) {
        this.fs.write(this.destinationPath(filePath), contents);
        return this;
    }

    /**
     * Write contents to destination as JSON file
     * @param  {string} filePath path of the file within destination directory
     * @param  {Object} contents content to write
     * @param  {...any} args     additional options. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {Generator}          this
     */
    writeJSON(filePath, contents, ...args) {
        this.fs.writeJSON(this.destinationPath(filePath), contents, ...args);
        return this;
    }

    /**
     * Load template
     * @param  {string} filePath path of the file within template directory
     * @return {function}        template function
     */
    loadTemplate(filePath) {
        return template(this.fs.read(this.templatePath(filePath)));
    }

    /**
     * Add more contents to destination JSON file
     * @param  {string} filePath path of the file within destination directory
     * @param  {Object} contents content to write
     * @param  {...any} args     additional arguments. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {Generator}          this
     */
    extendJSON(filePath, contents, ...args) {
        this.fs.extendJSON(this.destinationPath(filePath), contents, ...args);
        return this;
    }

    /**
     * Add more contents from the template file to the destination JSON file
     * @param  {string} filePath path of the template file within template directory
     * @param  {string} destPath path of the destination file within destination directory
     * @param  {Object} props    properties to pass to the template
     * @param  {...any} args     additional arguments. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {Generator}          this
     */
    extendJSONWithTemplate(filePath, destPath = null, props, ...args) {
        const template = this.loadTemplate(filePath);
        const partial = JSON.parse(template(props));
        return this.extendJSON(destPath || filePath, partial, ...args);
    }

    /**
     * Copy file from template directory to destination directory
     * @param  {string} filePath path of the template file within template directory
     * @param  {string} destPath path of the destination file within destination directory. If omitted, will use the same path as filePath.
     * @param  {Object} options  additional options. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {Generator}          this
     */
    copy(filePath, destPath = null, options) {
        this.fs.copy(
            this.templatePath(filePath),
            this.destinationPath(destPath || filePath),
            options
        );
        return this;
    }

    /**
     * Create content based on a template in template directory and write to destination directory
     * @param  {string} filePath path of the template file within template directory
     * @param  {string} destPath path of the destination file within destination directory. If omitted, will use the same path as filePath.
     * @param  {Object} props    properties to pass to the template
     * @param  {...any} args     additional arguments. See {@link https://github.com/sboudrias/mem-fs-editor|mem-fs-editor}
     * @return {Generator}          this
     */
    copyTemplate(filePath, destPath = null, props, ...args) {
        this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(destPath || filePath),
            props,
            ...args
        );
        return this;
    }

    /**
     * Check if the template file exists
     * @param  {string} filePath path of the file in template directory
     * @return {boolean}         true if the file exists
     */
    templateExists(filePath) {
        return this.fs.exists(this.templatePath(filePath));
    }

    /**
     * Check if the destination file exists
     * @param  {string} filePath path of the file in destination directory
     * @return {boolean}         true if the file exists
     */
    destinationExists(filePath) {
        return this.fs.exists(this.destinationPath(filePath));
    }

    /**
     * List files in the template directory
     * @param  {string} pattern       glob pattern for the files
     * @param  {Array.<string>} ignore  glob pattern(s) to ignore
     * @return {Array.<string>}         array of file names relative to the template path
     */
    listTemplateFiles(pattern, ignore) {
        const generator = this;
        return glob
            .sync(generator.templatePath(pattern), {
                nodir: true,
                ignore: ignore ? ignore.map(ig => generator.templatePath(ig)) : null
            })
            .map(d => d.replace(generator.templatePath('') + '/', ''));
    }

    /**
     * Copy files from template directory to destination directory.
     * Files with static content are copied directly.
     * Files with dynamic content are created using the template and given props.
     * @param  {string} pattern  glob pattern for the files
     * @param  {Object} options  options
     * @param  {Array.<string>}  options.ignore       glob pattern(s) to ignore
     * @param  {Array.<string>}  options.dynamicFiles array of files with dynamic content (need templating)
     * @param  {Object} options.props        properties for creating dynamic content
     * @return {Generator}          this
     */
    copyFiles(pattern, options = {}) {
        const { ignore = [], dynamicFiles = [], props } = options;
        const staticFiles = this.listTemplateFiles(
            pattern,
            dynamicFiles.concat(ignore)
        );

        staticFiles.forEach(file => this.copy(file));
        dynamicFiles.forEach(file => {
            this.copyTemplate(file, file, props);
        });

        return this;
    }

};