- [1. Introduction](#1-introduction)
- [2. Pre-requirement](#2-pre-requirement)
- [3. Installation](#3-installation)
- [4. Create the api project](#4-create-the-api-project)
- [5. Start your project](#5-start-your-project)
- [6. connect to api container](#6-connect-to-api-container)
- [7. misc operations inside container](#7-misc-operations-inside-container)
- [7. Authors/maintainers/contributors](#7-authorsmaintainerscontributors)

## 1. Introduction

A generator to generate mvp-rockets projects.

## 2. Pre-requirement

- Ubuntu 20.04.4 LTS
- docker(19.xx)
- docker-compose(1.28.xx)

## 3. Installation

```
npm i -g @mvp-rockets/namma-generator

```

## 4. Create the api project

```
namma_generate
```

## 5. Start your project

```
docker-compose up
```

## 6. connect to api container

one time run
`chmod +x connect.sh`

now run
`./connect.sh`

## 7. misc operations inside container

check: https://github.com/mvp-rockets/namma-generate/tree/master/namma-api-framework#readme

## 7. Authors/maintainers/contributors

- Yashjeet Luthra (yash@napses.com)
