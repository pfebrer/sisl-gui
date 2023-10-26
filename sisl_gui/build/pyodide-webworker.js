// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.json`,
// and `.wasm` files as well:
importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

init_script = `
import sisl
import sisl.viz
from sisl.nodes import Node, nodify_module

nodify_module(sisl)
        
@Node.from_func
def CONSTANT(value):
    return value

from sisl_gui.server.session import Session

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

    await pyodide.loadPackage(["numpy", "scipy", "xarray", "pyparsing", ])//"netCDF4"
    await pyodide.loadPackage("micropip")
        
    const micropip = pyodide.pyimport("micropip")
    globalThis.micropip = micropip
    await micropip.install("plotly")

    setStatus(103)

    await pyodide.loadPackage('./sisl-0.14.2-cp311-cp311-emscripten_3_1_45_wasm32.whl')

    setStatus(104)

    await pyodide.loadPackage(['simplejson'])
    // Install sisl-gui from PyPi without its dependencies
    await micropip.install("sisl-gui", false, false)

    setStatus(105)

    pyodide.runPython(init_script)

    await sendSession()

    setStatus(200)

}

async function sendSession() {
    const session = pyodide.globals.get("session")
    const session_obj = session.to_deep_json().toJs({dict_converter: Object.fromEntries})

    globalThis.session = session
    globalThis.session_obj = session_obj

    return self.postMessage({type: "session", session: session_obj})
}

async function applyMethod(methodName, args, kwargs) {
    console.log("APPLYING METHOD", methodName, kwargs, args)

    const py_args = args.map(arg => pyodide.toPy(arg))
    const py_kwargs = {}
    Object.keys(kwargs).forEach(key => {py_kwargs[key] = pyodide.toPy(kwargs[key])})

    const ret = await session[methodName].callKwargs(...py_args, py_kwargs)

    sendSession()

    return ret
}

async function runPython(code) {
    const result = await pyodide.runPython(code)
    sendSession()

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

        try {
            event.ports[0].postMessage({return: ret})
        } catch (e) {
            try {
                event.ports[0].postMessage({return: ret.toJs({dict_converter: Object.fromEntries})})
            } catch {
                event.ports[0].postMessage({return: null})
            } 
        }
        
    } else if (event.data.type === "session") {
        await sendSession()
    } else if (event.data.type === "runPython") {
        const result = await runPython(event.data.code)

        event.ports[0].postMessage({result: result.toString()})
    } else if (event.data.type === "writeFiles") {
        await writeFiles(event.data.files)

        event.ports[0].postMessage({done: true})
    }
}
