// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.json`,
// and `.wasm` files as well:
importScripts("https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js");

init_script = `
import sisl
import sisl.viz
from nodes import Node, nodify_module

# Patch Node with a dummy then attribute, because pyodide tries to call it
# when converting a node to JS. If we don't patch it, when getting "then" pyodide
# will create a "GetAttrNode" and then try to call it, which is catastrophic :)
Node.then = None

nodify_module(sisl)
        
@Node.from_func
def CONSTANT(value):
    return value

from sisl_gui.server.session import Session
from sisl_gui.server.pyodide import for_js as sisl_gui_for_js

session = Session()
`

state = {
    status: 100,
}

function setStatus(status) {
    state.status = status
    self.postMessage({type: "status", status: status})
}

async function loadRuntime() {

    setStatus(101)

    let pyodide = await loadPyodide()

    globalThis.pyodide = pyodide

    setStatus(102)

    const pypi_packages = pyodide.loadPackage("micropip").then(() => {
        console.log("Importing micropip")
        const micropip = pyodide.pyimport("micropip")
        console.log("Imported micropip")
        globalThis.micropip = micropip

        return Promise.all([
            micropip.install("plotly"),
            micropip.install("nodes"),
            // Install sisl-gui from PyPi without its dependencies
            //micropip.install("./sisl_gui-0.4.1-py3-none-any.whl", false, false)
            micropip.install("sisl-gui", false, false)
        ])
    })

    const pyodidePackages = Promise.all([
        pyodide.loadPackage(["numpy", "scipy", "xarray", "pyparsing", "netCDF4", "pyyaml", 'simplejson']),
        pyodide.loadPackage('./sisl-0.14.4.dev295+g00b8afa29d-cp312-cp312-emscripten_3_1_52_wasm32.whl')
    ])

    await pyodidePackages
    await pypi_packages

    setStatus(103)

    pyodide.runPython(init_script)

    await sendLastUpdate()

    setStatus(200)

}

async function sendLastUpdate() {
    const session = pyodide.globals.get("session")

    globalThis.session = session

    return self.postMessage({type: "last_update", last_update: session.last_update.toJs({dict_converter: Object.fromEntries})})
}

async function applyMethod(methodName, args, kwargs) {
    console.log("APPLYING METHOD", methodName, kwargs, args)

    const py_args = (args || []).map(arg => pyodide.toPy(arg))
    const py_kwargs = {}
    Object.keys(kwargs || {}).forEach(key => {py_kwargs[key] = pyodide.toPy(kwargs[key])})

    const ret = await session[methodName].callKwargs(...py_args, py_kwargs)

    sendLastUpdate()

    return ret
}

async function runPython(code) {
    const result = await pyodide.runPython(code)
    sendLastUpdate()

    return result
}

// Helper function that writes a file to the virtual filesystem
async function writeFile(file){
    const file_arr = await file.arrayBuffer()
    pyodide.FS.writeFile(file.name, new Uint8Array(file_arr))
}

async function writeFiles(files) {

    // Write all files to the virtual filesystem)
    const promises = Object.values(files).map(writeFile);
    // Wait for all files to be written
    await Promise.all(promises)

}

self.onmessage = async (event) => {

    console.log("MESSAGE", event.data)

    if (event.data.type === "loadRuntime") await loadRuntime()
    else if (event.data.type === "sessionMethod") {
        const {methodName, args, kwargs} = event.data

        const ret = await applyMethod(methodName, args, kwargs)

        const for_js = pyodide.globals.get("sisl_gui_for_js")

        try {
            event.ports[0].postMessage({return: for_js(ret)})
        } catch (e) {
            try {
                event.ports[0].postMessage({return: for_js(ret).toJs({dict_converter: Object.fromEntries})})
            } catch {
                event.ports[0].postMessage({return: null})
            } 
        }
        
    } else if (event.data.type === "last_update") {
        await sendLastUpdate()
    } else if (event.data.type === "runPython") {

        const result = await runPython(event.data.code)
        event.ports[0].postMessage({result: result.toString()})
        
    } else if (event.data.type === "writeFiles") {
        await writeFiles(event.data.files)

        event.ports[0].postMessage({done: true})
    }
}
