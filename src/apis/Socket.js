import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

export class PythonApi {

    constructor() {

        this.apiAdress = 'http://localhost:4000'

        this.user = undefined

        this.connect()

        this.updateSessionSettings({rootDir: "/home/pfebrer/Simulations/Master/Simulations/NPG/relaxedStructure"})

    }

    connect = (address) => {

        if (address) this.apiAdress = address

        this.socket = io(this.apiAdress);
        this.setupListeners()

        this.socket.connect()

    }

    setupListeners = () => {

        this.socket.on('connect', this.askForSession);

        this.socket.on('error', this.handleError);
        
        this.socket.on('current_session', (session) => {
            toast.warn("RECEIVED SESSION")
            document.dispatchEvent(new CustomEvent("syncWithSession", { detail: { session } }))
        })

        this.socket.on('loading_plot', (info) => {
            toast.warn("LOADING PLOT")
            document.dispatchEvent(new CustomEvent("loadingPlot", { detail: info }))
        })

        this.socket.on('plot', (plot) => {
            toast.warn("RECEIVED PLOT")
            document.dispatchEvent(new CustomEvent("plot", { detail: { plot } }))
        })

    }

    handleError = (err) => {
        toast.error("THERE WAS A PYTHON ERROR:\n" + err)
    }

    askForSession = (path) => {
        this.socket.emit('request_session', path)
    }

    loadSession = (path) => {
        this.askForSession(path)
    }

    newProcessId = uuidv4

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

        this.socket.emit("apply_method_on_session", methodName, kwargs, ...args)
    }

    updateSessionSettings = (newSettings) => {
        this._sessionMethod("updateSettings", newSettings)
    }

    undoSessionSettings = () => {
        this._sessionMethod("undoSettings")
    }

    addTab = () => {
        this._sessionMethod("addTab")
    }

    removeTab = (tabID) => {
        this._sessionMethod("removeTab", {tabID})
    }

    updateTab = (tabID, newParams) => {
        this._sessionMethod("updateTab", { tabID, newParams })
    }

    setTabLayouts = (tabID, layouts) => {
        this.updateTab(tabID, {layouts})
    }

    saveSession = (path) => {
        this._sessionMethod("save", {path})
    }

    getPlot = (plotID) => {
        document.dispatchEvent(new CustomEvent("updatingPlot", {detail: {plot_id: plotID}}))
        this.socket.emit("get_plot", plotID)
    }

    newPlot = (newPlotKwargs) => {
        this._sessionMethod("newPlot", newPlotKwargs)
    }

    removePlot = (plotID) => {
        this._sessionMethod("removePlot", null, null, plotID)
    }

    _plotMethod = (plotID, methodName, kwargs, callback, ...args) => {
        this._sessionMethod("_run_plot_method", kwargs, callback, plotID, methodName, ...args)
    }

    showPlotFullScreen = (plotID) => {
        this._plotMethod(plotID, "show")
    }

    updatePlotSettings = (plotID, settings) => {
        this._plotMethod(plotID, "updateSettings", settings)
    }

    undoPlotSettings = (plotID) => {
        this._plotMethod(plotID, "undoSettings")
    }

    callPlotShortcut = (plotID, sequence) => {
        this._plotMethod(plotID, "call_shortcut", null, null, sequence)
    }

}

export default new PythonApi();