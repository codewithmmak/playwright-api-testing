---
# Playwright API Testing Setup Guide
---

This is a Playwright API testing framework designed to demonstrate playwright api testing example

## Features of this framework
* Playwright API Testing
* <a href="http://www.lambdatest.com?fp_ref=md-moeen-ajaz40" target="_blank">Cloud Integration: LambdaTest</a>

## Getting started

### Pre-requisites
* Download and install Node.js
* Download and install any Text Editor like Visual Code/Sublime/Brackets

### Setup Visual Code
* Install GitLens Extension from the Marketplace: `GitLens — Git supercharged by GitKraken https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens`
* Go to Visual Code Preference > Setting and search `formatOnSave` and enable/ON it.

### Setup Scripts 
* Clone the repository into a folder
* Go to Project root directory and install Dependency: `npm install`
* All the dependencies from package.json would be installed in node_modules folder.

## How to Run Test Locally
* Go to the Project root directory and run command: `npm test`

## How to view default Playwright HTML report
* Go to the Project root directory: `./playwright-report/index.html`

### Playwright HTML Test Report
![Playwright HTML Test Report](./assets/html-test-report.PNG?raw=true "Playwright HTML Test Report")

## How to view Allure HTML report
* Go to the Project root directory and run command: `npm run allure-reporter` and then run `npm run generate-allure-report`
* Go to the Project root directory: `./allure-report/index.html`

### Allure Test Report
![Allure Test Report](./assets/allure-test-report.png?raw=true "Allure Test Report")

![Allure Test Report Expanded View](./assets/allure-test-report-expanded-view.png?raw=true "Allure Test Report Expanded View")

## How to Run Test on LambdaTest Cloud
* Go to Project root directory and run command: `npm run lambdatest`

### Terminal Test Result
![Terminal Test Result](./assets/terminal-lt.PNG?raw=true "Terminal Test Result")

### LambdaTest Cloud Results
![LambdaTest Cloud Results](./assets/lambdatest-results.png?raw=true "LambdaTest Cloud Results")

![LambdaTest Cloud Results Expanded View](./assets/lambdatest-results-expanded-view.png?raw=true "LambdaTest Cloud Results Expanded View")
