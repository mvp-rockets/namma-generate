- [1. Introduction](#1-introduction)
- [2. Pre-requirement](#2-pre-requirement)
- [3. Installation](#3-installation)
- [4. Create the project/boilerplate codes.](#4-create-the-projectboilerplate-codes)

## 1. Introduction

A generator to generate mvp-rockets projects/boilerplate codes.

## 2. Pre-requirement

- Ubuntu 20.04 or above
- docker(19.xx or above) 
- docker-compose(1.28.xx or above)

## 3. Installation

```
npm i -g @mvp-rockets/namma-generator

```

## 4. Create the project/boilerplate codes.

```
mkdir project-name && cd project-name
namma_generate
```

Questions asked during the generation process:
Project Name: (defaults to the current directory name)

Services to setup:
  - Namma API Service: Installs [mvp-rockets api](https://github.com/mvp-rockets/backend-core) boilerplate code.
  - Next.js Web Site: Installs [mvp-rockets web](https://github.com/mvp-rockets/frontend-nextjs-core) boilerplate code.
  - Nuxt.js API Service: Work in progress. Not available yet
  - Deployment Scripts: Bash based [deployment scripts](https://github.com/mvp-rockets/deployment_scripts).

Service Name: 
  - Will create a sub-directory of that name and copy the service code.
  - Will define the service name within package.json as `project-name-service-name` (e.g. project-api)
  - Set the service version as **1.0.0**

In case of API, additional prompt "Cloud Provider" is asked for.
- Currently we have only published the AWS version.