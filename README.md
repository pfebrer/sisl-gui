This is the graphical interface that you can use to interact with [sisl's](https://github.com/zerothi/sisl) visualization module.

It consists of two parts:
- [Back-end](sisl_gui): A `Session` class, which stores and manipulates the state of the application. This app can then be connected
to the frontend in multiple ways. Currently, it is possible to use the `Session` directly in the browser (thanks to pyodide) or connect
it to the frontend via sockets (implemented as a `flask` app that uses `flask-socketio`).
- [Front-end](frontend): A javascript/typescript UI, which is developed using [React](https://reactjs.org/). The build is shipped with
the python module and it is also available at https://pfebrer.github.io/sisl-gui/.

# User guide

## Installation

It is extremely simple to install `sisl-gui` with `pip`:

```
pip install sisl-gui
```

## Usage

### From a terminal

You can use the `sisl-gui` command.

### From python

```python
import sisl_gui

app = sisl_gui.launch()
```

# Info for developers

## The build branch

The `build` branch contains the ready-to-use UI. You can download its contents and open `index.html` in your favorite browser to start enjoying it.

This branch is shipped automatically with the `sisl-gui` package and is available at [`https://pfebrer.github.io/sisl-gui/`](https://pfebrer.github.io/sisl-gui/) (hosted by github pages).

When a commit is pushed to the `master` branch and files inside the `frontend` folder have been modified, a build is generated and this branch is automatically updated through Github Actions.

## Source branches

The rest of branches are sources. 

If you want to develop a new feature of the UI, you'll need to have [`nodejs`](https://nodejs.org/en/) and [`npm`](https://www.npmjs.com/) installed. Then, just clone this directory, start a new branch, and run `npm install` inside the `frontend` directory. This should install all the project's dependencies as listed in the `package.json` file. Then just run `npm start` to start a development server where you can visualize your code changes in real time. If you want to generate a production build, you should run `npm run build`.

## Integration between front-end and python package

The same trigger that updates the [build branch](#the-build-branch) also pushes the new build to [its location in the python package](sisl_gui/build). So, any change implemented to the front-end is immediately synced to the python package if the tests pass succesfully. Therefore, don't forget to `git pull` to get the last build!
