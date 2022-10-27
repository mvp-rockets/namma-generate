#!/usr/bin/env node
import inquirer from "inquirer"
import * as fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
const CURR_DIR = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import ora from 'ora';
import * as subProcess from 'child_process'
import chalk from 'chalk';

const apiProjectTemplate = "api-framework";
const uiProjectTemplate = "ui-framework"
const spinner = ora('Loading');

//Welcome Message
const log = console.log;
log(chalk.blue('Lets Begin'));

const projectTypeQuestion = [
    {
        message: 'What you want?',
        type: 'list',
        name: "projectType",
        choices: [
            {
                name: 'API Project',
                value: 'api_project',
                description: 'Mvp Rocket API project',
            },
            {
                name: 'UI Project',
                value: 'ui_project',
                description: 'Mvp Rocket UI Project',
            }
        ]
    }
];

const projectNameQuestion = [
    {
        name: 'project_name',
        type: 'input',
        message: 'Project name:',
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    }
];

inquirer.prompt(projectTypeQuestion).then(projectTypeAnswer => {
    const projectType = projectTypeAnswer['projectType'];
    inquirer.prompt(projectNameQuestion).then(projectNameAnswer => {
        const projectName = projectNameAnswer['project_name']
        spinner.start();
        if (projectType === 'api_project') {
            const templatePath = `${__dirname}/${apiProjectTemplate}`;
            fs.mkdirSync(`${CURR_DIR}/${projectName}`);
            createApiProjectDirectoryContents(templatePath, projectName, projectName, apiProjectTemplate);
        }
        if (projectType === 'ui_project') {
            const templatePath = `${__dirname}/${uiProjectTemplate}`;
            fs.mkdirSync(`${CURR_DIR}/${projectName}`);
            createUiProjectDirectoryContents(templatePath, projectName, projectName);
        }
        updateVersion(projectName);
    });
});

function updateVersion(projectName) {
    const writePath = `${CURR_DIR}/${projectName}/`;
    subProcess.exec(`cd ${writePath} && npm version 1.0.0 --no-git-tag-version --allow-same-version=true`, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            console.log(`Failed to update package version`)
            process.exit(1)
        }
        spinner.succeed(chalk.green('All done, Happy coding!!!'))
    })
}

function createApiProjectDirectoryContents(templatePath, newProjectPath, projectName) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(origFilePath);
        if (stats.isFile()) {
            const contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            let updateContent;
            if (file === 'package.json') {
                updateContent = contents.split(/namma-api-framework/).join(projectName)
            } else {
                updateContent = contents.split(/<namma-api-framework>/).join(projectName)
            }
            fs.writeFileSync(writePath, updateContent, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
            createApiProjectDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName);
        }
    });
}

function createUiProjectDirectoryContents(templatePath, newProjectPath, projectName) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(origFilePath);
        if (stats.isFile()) {
            const contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            let updateContent;
            if (file === 'package.json') {
                updateContent = contents.split(/namma-ui-framework/).join(projectName)
            } else {
                updateContent = contents.split(/<namma-ui-framework>/).join(projectName)
            }
            fs.writeFileSync(writePath, updateContent, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
            createApiProjectDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName);
        }
    });
}

