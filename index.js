#!/usr/bin/env node
import inquirer from "inquirer"
import * as fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
const CURR_DIR = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateProjectName = "api-framework";
const QUESTIONS = [
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    }
];

inquirer.prompt(QUESTIONS).then(answers => {
    const projectName = answers['project-name'];
    const templatePath = `${__dirname}/${templateProjectName}`;
    fs.mkdirSync(`${CURR_DIR}/${projectName}`);
    createDirectoryContents(templatePath, projectName, projectName);
});

function createDirectoryContents(templatePath, newProjectPath, projectName) {
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
            createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName);
        }
    });
}

