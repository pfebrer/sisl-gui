This is the graphical interface that you can use to interact with [sisl's](https://github.com/zerothi/sisl) visualization module.

The GUI is developed using [React](https://reactjs.org/).

## The build branch

The build branch contains the ready-to-use GUI. You can download its contents and open `index.html` in your favorite browser to start enjoying it.

This branch is shipped automatically with sisl and is available at [`sisl-siesta.xyz`](https://sisl-siesta.xyz) (hosted by github pages).

When a commit is pushed to the `master` branch, a build is generated and this branch is automatically updated through Github Actions.

## Source branches

The rest of branches are sources. 

If you want to develop a new feature, you'll need to have [`nodejs`](https://nodejs.org/en/) and [`npm`](https://www.npmjs.com/) installed. Then, just clone this directory, start a new branch, and run `npm install` inside the directory. This should install all the project's dependencies as listed in the `package.json` file. Then just run `npm start` to start a development server where you can visualize your code
changes in real time. If you want to generate a production build, you should run `npm run build`.
