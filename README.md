---
# Playwright API Testing Setup Guide
---

This is a Playwright API testing framework designed to demonstrate playwright api testing example

## Features of this framework
* Playwright API Testing

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

## How to Run Single Spec Locally
* Go to the Project root directory and run command: `npx playwright test tests/01_post_static_data.spec.js`

## How to view default Playwright HTML report
* Go to the Project root directory: `./playwright-report/index.html`

### Playwright HTML Test Report
![Playwright HTML Test Report](./assets/html-test-report.PNG?raw=true "Playwright HTML Test Report")