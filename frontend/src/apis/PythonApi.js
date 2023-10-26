import io from 'socket.io-client';
import { toast } from 'react-toastify';

class PythonApi {

    static defaultApiSettings = {}

    status_codes = {
        0: "Not initialized",
        100: "Not connected",
        200: "Connected",
    }

    type = "none"

    constructor(settings) {

        this.apiSettings = { ...this.constructor.defaultApiSettings, ...settings}

        this.connectCallbacks = []
        this.disconnectCallbacks = []
        this.receiveSessionCallbacks = []

        this.setStatus(100)
    }

    setApiSettings = (settings) => {
        this.apiSettings = { ...this.apiSettings, ...settings}
    }

    connect = () => {}

    onConnect = (callback, ...args) => {
        this.connectCallbacks.push(callback)
    }

    onDisconnect = (callback, ...args) => {
        this.disconnectCallbacks.push(callback)
    }

    onReceiveSession = (callback, ...args) => {
        this.receiveSessionCallbacks.push(callback)
    }

    receivedSession = (session) => {
        this.session = session
        this.receiveSessionCallbacks.forEach(callback => callback(session))
    }

    get connected() {
        return this.status >= 200
    }

    get loading () {
        return this.status > 100 && this.status < 200
    }

    setStatus = (status) => {
        this.status = status
        if (status === 200) this.connectCallbacks.forEach(callback => callback())
        this.onStatusChange(status)
    }

    onStatusChange = (status) => {
        document.dispatchEvent(new CustomEvent("apiStatusChange", { detail: { status } }))
    }

    handleError = (err, type) => {
        if (type === "server"){
            toast.error("THERE WAS A PYTHON ERROR:\n" + err)
        } else {
            toast.error(err)
        }
        
    }

    _sessionMethod = (methodName, kwargs, callback, ...args) => {
        // SHOULD BE OVERRIDEN BY CHILD CLASSES TO CALL A METHOD ON THE PYTHON SESSION
    }

    getFilePlotOptions = async (filename) => {
        return this._sessionMethod("get_file_plot_options", { file_name: filename })
    }

    plotUploadedFile = async (file, method, plot_name, additional_files) => {

        const additional_filesDict = {}
        if (additional_files) {
            additional_files.forEach(file => {
                additional_filesDict[file.name] = file
            })
        }

        return this._sessionMethod("plot_uploaded_file", { file_bytes: file, name: file.name, method: method , node_name: plot_name, additional_files: additional_filesDict })
    }

    getNode = async (name) => {
        return this._sessionMethod("get_node", { key: name })
    }

    removeNode = async (name) => {
        return this._sessionMethod("remove_node", { key: name })
    }

    initNode = async (node_class, kwargs, inputModes) => {
        return this._sessionMethod("init_node",  {cls: node_class, kwargs: kwargs || {}, input_modes: inputModes || {}})
    }

    duplicateNode = async (name) => {
        return this._sessionMethod("duplicate_node", { key: name })
    }

    computeNode = async (name) => {
        return this._sessionMethod("compute_node", { key: name })
    }

    nodeToWorkflow = async (name) => {
        return this._sessionMethod("node_to_workflow", { key: name })
    }

    renameNode = async (name, newName) => {
        return this._sessionMethod("rename_node", { key: name, name: newName })
    }

    updateNodeInputs = async (name, kwargs, inputModes) => {
        return this._sessionMethod("update_node_inputs", { key: name, kwargs: kwargs || {}, input_modes: inputModes || {} })
    }

    runPython = async (code) => {
        console.error("It is not possible to run arbitrary python code with this backend")
        return "It is not possible to run arbitrary python code with this backend."
    }
}

class SocketPythonApi extends PythonApi {

    static defaultApiSettings = {
        apiAddress: 'http://localhost:4000',
        user: null,
    }

    status_codes = {
        0: "Not initialized",
        100: "Not connected",
        101: "Trying to connect",
        200: "Connected",
    }

    type = "socket"

    constructor(settings) {
        super(settings)

        this.listeners = []
        this.setupListeners()

        this.connect()

        document.api = this
    }

    get apiAddress() {
        return this.apiSettings.apiAddress
    }

    connect = () => {

        this.externalListeners = {}

        this.socket = io(this.apiAddress);
        this.listeners.forEach(listener => this.socket.on(...listener))

        this.socket.connect()

    }

    setApiSettings = (settings) => {
        this.apiSettings = { ...this.apiSettings, ...settings}
        this.disconnect()
        this.connect()
    }

    disconnect = () => {
        this.socket.disconnect()
    }

    on = (...args) => {

        if (this.socket){
            this.socket.on(...args)
        }
        // In this way all the listeners are registered each time
        // The socket changes
        this.listeners.push(args)
    }

    onConnect = (...args) => {
        this.on('connect', ...args)
    }

    onDisconnect = (...args) => {
        this.on('disconnect', ...args)
    }

    setupListeners = () => {

        this.on('connect', () => {
            //document.dispatchEvent(new Event('socket_connect'))
            this.setStatus(200)
            clearTimeout(this.connectionTimeOut)
            this.requestSession()
        });

        this.on('disconnect', (reason) => {
            console.warn("DISCONNECT REASON", reason)
            this.setStatus(100)
            this.disconnect()
            this.connect()
        });

        this.on('auth_required', this.askForAuth)

        this.on('logged_in', this.requestSession)

        this.on('error', (err) => this.handleError(err, "socket"));

        this.on('server_error', (err) => this.handleError(err, "server"));
        
        this.on('current_session', (session) => {
            document.session = session
            this.receivedSession(session)
        })

        this.on('loading_plot', (info) => {
            document.dispatchEvent(new CustomEvent("loadingPlot", { detail: info }))
        })

        this.on('plot', (plot) => {
            document.dispatchEvent(new CustomEvent("plot", { detail: { plot } }))
        })

    }

    requestSession = (path) => {
        this.socket.emit('request_session', path, (session) => {
            document.session = session
            this.receivedSession(session)
        })
    }

    _sessionMethod = (methodName, kwargs, callback, ...args) => {
        /* With this you can call any session method
        
        However this method should not be directly used.
        A new method should be defined in this class to avoid 
        headaches with changes in method names in sisl.viz.Session
        
        You have the possibility to set up a callback, but remember that 
        by default the session will be emitted by the server and its update
        is automatic. Therefore, only use the callback if you are using a
        "getter" method and you want to act according to the results. You may
        want also to inform the user that the process has finished. But again,
        this behavior should also be taken care of automatically.*/

        if (callback) {
            
        }

        console.log("APPLYING METHOD", methodName, kwargs, args)
        return this.socket.emitWithAck("apply_method_on_session", methodName, kwargs, ...args)
    }

}

class PyodidePythonApi extends PythonApi {

    type = "pyodide"

    static defaultApiSettings = {
        mounts: [],
    }

    status_codes = {
        0: "Not initialized",
        100: "Not connected",
        101: "[1 / 5] Loading pyodide",
        102: "[2 / 5] Loading sisl dependencies",
        103: "[3 / 5] Loading sisl",
        104: "[4 / 5] Loading sisl_gui",
        105: "[5 / 5] Importing packages and initializing session",
        200: "Connected",
    }

    constructor(settings) {
        super(settings)

        this.connect()

        document.api = this
    }

    async loadPyodide() {
        this.pyodide = await window.loadPyodide()
    }

    connect = async () => {

        this.pyodide_worker = new Worker("pyodide-webworker.js")

        this.pyodide_worker.onmessage = (event) => {
            if (event.data.type === "status") {
                this.setStatus(event.data.status)
            } else if (event.data.type === "session") {
                this.session = event.data.session

                this.receivedSession(this.session)
            }
        }

        this.pyodide_worker.postMessage({type: "loadRuntime"})

    }

    _sessionMethod = (methodName, kwargs, callback, ...args) => {

        return new Promise((res, rej) => {
            // create a channel
            const channel = new MessageChannel(); 

            channel.port1.onmessage = (event) => {
                res(event.data.return)
            }

            this.pyodide_worker.postMessage({type: "sessionMethod", methodName, kwargs, args}, [channel.port2])
        
        });

    }

    requestSession = (path) => {

        this.pyodide_worker.postMessage({type: "session"})
    
    }

    plotUploadedFile = async (file, method, plot_name, additional_files) => {

        return new Promise((res, rej) => {
            // create a channel
            const channel = new MessageChannel(); 

            channel.port1.onmessage = (event) => {
                res(this._sessionMethod("plot_uploaded_file", { file_bytes: null, name: file.name, method: method , node_name: plot_name }))
            }
        
            this.pyodide_worker.postMessage({type: "writeFiles", files: [file, ...additional_files]}, [channel.port2])
        });
        
    }

    runPython = async (code) => {

        return new Promise((res, rej) => {
            // create a channel
            const channel = new MessageChannel(); 

            channel.port1.onmessage = (event) => {
                res(event.data.result)
            }
        
            this.pyodide_worker.postMessage({type: "runPython", code}, [channel.port2])
        });

    }
}

export {PythonApi, SocketPythonApi, PyodidePythonApi}
