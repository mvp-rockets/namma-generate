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

const templates = {
    "api_project": {
        name: 'api-framework',
        readmeUrl: "https://github.com/mvp-rockets/backend-core/blob/master/README.md"
    },
    "ui_project": {
        name: 'ui-framework',
        readmeUrl: "https://github.com/mvp-rockets/frontend-nextjs-core/blob/master/README.md"
    },
    "deployment_scripts": {
        name: 'deployment_scripts',
        readmeUrl: "https://github.com/mvp-rockets/deployment_scripts/blob/master/README.md"
    }
};

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
            },
            {
                name: 'Deployment scripts',
                value: 'deployment_scripts',
                description: 'Mvp Rocket Deployment Scripts',
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

const projectCloudServiceQuestion = [
    {
        message: 'Which cloud service you want to use?',
        type: 'list',
        name: "projectCloudService",
        choices: [
            {
                name: 'Amazon Web Services',
                value: 'aws',
                description: 'Mvp Rocket API project with aws',
            },
            {
                name: 'Google Cloud Platform',
                value: 'gcp',
                description: 'Mvp Rocket API Project with gcp',
            }
        ]
    }
];

const deploymentScriptFolderNameQuestion = [
    {
        name: 'folder_name',
        type: 'input',
        message: 'Folder name:',
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Folder name may only include letters, numbers, underscores and hashes.';
        }
    }
];


inquirer.prompt(projectTypeQuestion).then(projectTypeAnswer => {
    const projectType = projectTypeAnswer['projectType'];
    if (projectType === 'api_project' || projectType === 'ui_project') {
        inquirer.prompt(projectNameQuestion).then(projectNameAnswer => {
            const projectName = projectNameAnswer['project_name']
            const projectTemplate = templates[projectType];
            const templatePath = `${__dirname}/${projectTemplate.name}`;
            fs.mkdirSync(`${CURR_DIR}/${projectName}`);
            if (projectType === 'api_project') {
                inquirer.prompt(projectCloudServiceQuestion).then(projectCloudServiceAnswer => {
                    spinner.start();
                    createApiProjectDirectoryContents(projectType, templatePath, projectName, projectName, projectCloudServiceAnswer.projectCloudService)
                    updateVersion(projectName, projectTemplate.readmeUrl);
                })
            }
            else {
                spinner.start();
                createUiProjectDirectoryContents(templatePath, projectName, projectName);
                updateVersion(projectName, projectTemplate.readmeUrl);
            }
        });
    } else {
        inquirer.prompt(deploymentScriptFolderNameQuestion).then(folderNameAnswer => {
            const folderName = folderNameAnswer['folder_name']
            const projectTemplate = templates['deployment_scripts'];
            spinner.start();
            const templatePath = `${__dirname}/${projectTemplate.name}`;
            fs.mkdirSync(`${CURR_DIR}/${folderName}`);
            createDeploymentScriptsDirectoryContents(templatePath, folderName, folderName);
            spinner.succeed(chalk.green(`All done, \nPlease follow ${projectTemplate.readmeUrl} to setup your deployment\nHappy coding!!!`))
        });
    }
});

function updateVersion(projectName, readmeUrl) {
    const writePath = `${CURR_DIR}/${projectName}/`;
    subProcess.exec(`cd ${writePath} && npm version 1.0.0 --no-git-tag-version --allow-same-version=true`, (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            console.log(`Failed to update package version`)
            process.exit(1)
        }
        spinner.succeed(chalk.green(`All done, \nPlease follow ${readmeUrl} to start your application\nHappy coding!!!`))
    })
}

const apiFilesOrFolderNotToCreate = {
    gcp: ['aws-config.js', 'gcp-config.js', 'gcp-env', 'aws-env', 'SQS',
        'queues-scripts', 'elasticmq', 'aws', 'aws-initial_api_setup.sh', 'gcp-initial_api_setup.sh',
        'aws-deploy-api.sh', 'gcp-deploy-api.sh'],
    aws: ['aws-config.js', 'gcp-config.js', 'gcp-env', 'aws-env', 'PUBSUB',
        'topics-scripts', 'gcp', 'gcp-initial_api_setup.sh', 'aws-initial_api_setup.sh',
        'aws-deploy-api.sh', 'gcp-deploy-api.sh']
}

function createApiProjectDirectoryContents(projectType, templatePath, newProjectPath, projectName, projectCloudServiceAnswer = 'aws') {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(origFilePath);
        if (apiFilesOrFolderNotToCreate[projectCloudServiceAnswer]?.includes(file)) {
            return;
        }
        if (stats.isFile()) {
            let contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            if (newProjectPath.split('/').pop() === 'env' && (projectType === 'api_project' || projectType === 'deployment_scripts')) {
                const serviceEnvPath = templatePath.split('/');
                serviceEnvPath[serviceEnvPath.length - 1] = `${projectCloudServiceAnswer}-${serviceEnvPath[serviceEnvPath.length - 1]}`
                const envContents = fs.readFileSync(`${serviceEnvPath.join('/')}/${file}`, 'utf8')
                contents += `\n${envContents}`;
            }
            let updateContent;

            if (file === 'config.js' && projectType === 'api_project') {
                const envContents = fs.readFileSync(`${templatePath}/${projectCloudServiceAnswer}-config.js`, 'utf8');
                contents = contents.split(/'serviceProviderConfig'/).join(envContents.split('serviceProvider =')[1])
            }

            if (file === 'initial_api_setup.sh' && projectType === 'deployment_scripts') {
                const envContents = fs.readFileSync(`${templatePath}/${projectCloudServiceAnswer}-initial_api_setup.sh`, 'utf8')
                contents = contents.split(/<exportingCredentials>/).join(envContents)
            }
            if (file === 'deploy-api.sh' && projectType === 'deployment_scripts') {
                const envContents = fs.readFileSync(`${templatePath}/${projectCloudServiceAnswer}-deploy-api.sh, 'utf8'`)
                contents = contents.split(/<runningInitialApiSetup>/).join(envContents)
            }

            if (file === 'build-env-index.js' && projectType === 'api_project') {
                const envContents = fs.readFileSync(`${templatePath}/${projectCloudServiceAnswer}-build-env-index.js`, 'utf8')
                contents += envContents
            }

            if (file === 'package.json') {
                updateContent = contents.split(/namma-api-framework/).join(projectName)
            } else {
                updateContent = contents.split(/<namma-api-framework>/).join(projectName)
            }
            fs.writeFileSync(writePath, updateContent, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
            createApiProjectDirectoryContents(projectType, `${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName, projectCloudServiceAnswer);

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
            createApiProjectDirectoryContents('ui_project', `${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName);
        }
    });
}

function createDeploymentScriptsDirectoryContents(templatePath, newProjectPath, projectName) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;
        const stats = fs.statSync(origFilePath);
        if (stats.isFile()) {
            const contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            fs.writeFileSync(writePath, contents, 'utf8');
        } else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
            createApiProjectDirectoryContents('deployment_scripts', `${templatePath}/${file}`, `${newProjectPath}/${file}`, projectName);
        }
    });
}



