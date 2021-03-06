# JMoney

[![Build Status](https://travis-ci.org/jogy/jmoney.svg?branch=master)](https://travis-ci.org/jogy/jmoney) 
[![codecov](https://codecov.io/gh/jogy/jmoney/branch/master/graph/badge.svg)](https://codecov.io/gh/jogy/jmoney)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](http://jogy.mit-license.org)

JMoney is a personal finance tracker written in Kotlin/Spring Boot and TypeScript/Angular 2. 

The project serves as a non-trivial showcase and demonstrates some core software engineering principles using modern 
frameworks and programming languages.

## Running locally

```
git clone https://github.com/jogy/jmoney.git
cd jmoney
./gradlew bootRun
```
Then fire up a browser at <http://localhost:8080>.

## Running with Docker

You can pull a Docker image from Docker Hub:

```
docker run -ti -p 8080:8080 jogy/jmoney:<tag>
```
(See <https://hub.docker.com/r/jogy/jmoney/tags/> for valid tags.)

You can also build the Docker image before running it:
```
git clone https://github.com/jogy/jmoney.git
cd jmoney
./gradlew buildDocker
docker run -ti -p 8080:8080 jogy/jmoney
```

## Development

* Back-end dev: Run JMoneyApplication in your IDE. It will listen on http://localhost:8080.
* Front-end dev: `cd front-end; npm install; npm start`. This will start a separate web server on 
  <http://localhost:4200> for the front-end and it will proxy requests to http://localhost:8080. See 
  [front-end/README.md](front-end/README.md) for details.
