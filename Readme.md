# Extend-Woocommerce

This project integrates Extend into WooCommerce's platform.

<img src="https://media-exp1.licdn.com/dms/image/C560BAQEC8uvUayHVxw/company-logo_200_200/0?e=1590019200&v=beta&t=Cu8En-2EQZSiCgdF-W3uXlSaeDzkwk8KvQckEvhqLGY" width="50" height="50" >
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/250px-WooCommerce_logo.svg.png" height="50" >

### Getting Started

**Important**: run `./init` after you clone the repo. It will set up the enviroment for you

`yarn start` will automate the build and start the app. This nukes the build folder as well.

`yarn build` will build a new version. `npm start` calls upon this script.

`yarn lint` will lint your files for you.

### Structure

`/src` houses the source files

`/build` houses the compiled files once `yarn build`

> `yarn start` calls upon `yarn build`

### Manual Setup for Sync

In case you want to manually run the sync or are having trouble with the current sync, there is a JavaScript Version runable [here](https://repl.it/@Tjimenez3/Testing-Repl).

### Contribution Rules

**🛑 DO NOT CIRCUMVENT GIT HOOKS 🛑**

Fix your errors and warnings, and then push. Do not change any of the config files without everyones approval.

### Authors

Marko Crnkovic

Tony Jimenez

Paul Ke
