import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import toastPrompt, {connectionPrompt} from '../components/prompts/Prompt';

export class PythonApi {

    constructor() {

        this.apiAddress = 'http://localhost:4000'

        this.user = undefined

        this.connect()

        /*This can be dangerous in the browser if the user let's other websites
        access this tab. By default it is not possible, one would have to download
        an extension to make it possible, but still. */ 
        document.api = this

    }

    connect = (address) => {

        if (address) this.apiAddress = address

        this.socket = io(this.apiAddress);
        this.setupListeners()

        // Timeout to prompt the user for a new api address if the socket fails to connect
        this.connectionTimeOut = setTimeout(() => {

            connectionPrompt(this.apiAddress, (newAddress) => {
                if (newAddress) {
                    this.apiAddress = newAddress.trim()
                }
                if (!this.socket.connected){
                    this.disconnect()
                    this.connect()
                }
                
            }, {controlClose: (close) => this.onConnect(close)})
            
        }, 3000)

        

        this.socket.connect()

    }

    disconnect = () => {
        this.socket.disconnect()
    }

    on = (...args) => {
        this.socket.on(...args)
    }

    onConnect = (...args) => {
        this.on('connect', ...args)
    }

    onDisconnect = (...args) => {
        this.on('disconnect', ...args)
    }

    setupListeners = () => {

        this.on('connect', () => {
            clearTimeout(this.connectionTimeOut)
            this.requestSession()
        });

        this.on('disconnect', () => {
            this.disconnect()
            this.connect()
        });

        this.on('auth_required', this.askForAuth)

        this.on('logged_in', this.requestSession)

        this.on('error', (err) => this.handleError(err, "socket"));

        this.on('server_error', (err) => this.handleError(err, "server"));
        
        this.on('current_session', (session) => {
            document.dispatchEvent(new CustomEvent("syncWithSession", { detail: { session } }))
        })

        this.on('loading_plot', (info) => {
            document.dispatchEvent(new CustomEvent("loadingPlot", { detail: info }))
        })

        this.on('plot', (plot) => {
            document.dispatchEvent(new CustomEvent("plot", { detail: { plot } }))
        })

    }

    handleError = (err, type) => {
        if (type == "server"){
            toast.error("THERE WAS A PYTHON ERROR:\n" + err)
        } else {
            toast.error(err)
        }
        
    }

    askForAuth = () => {

        if (this.authenticating) return

        this.authenticating = true
        toastPrompt((username) => {
            this.socket.emit("login", username)
            this.authenticating = false
        })
    }

    requestSession = (path) => {
        this.socket.emit('request_session', path)
    }

    loadSession = (path) => {
        this.requestSession(path)
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
        this._sessionMethod("update_settings", newSettings)
    }

    undoSessionSettings = () => {
        this._sessionMethod("undo_settings")
    }

    addTab = (tabName) => {
        this._sessionMethod("add_tab", {name: tabName})
    }

    removeTab = (tabID) => {
        this._sessionMethod("remove_tab", {tabID})
    }

    updateTab = (tabID, newParams) => {
        this._sessionMethod("update_tab", { tabID, newParams })
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
        this._sessionMethod("new_plot", newPlotKwargs)
    }

    removePlot = (plotID) => {
        this._sessionMethod("remove_plot", null, null, plotID)
    }

    movePlot = (plotID, tab) => {
        this._sessionMethod("move_plot", null, null, plotID, tab)
    }

    mergePlots = (plotIDs, to) => {
        this._sessionMethod("merge_plots", {to}, null, plotIDs)
    }

    _plotMethod = (plotID, methodName, kwargs, callback, ...args) => {
        this._sessionMethod("_run_plot_method", kwargs, callback, plotID, methodName, ...args)
    }

    showPlotFullScreen = (plotID) => {
        this._plotMethod(plotID, "show")
    }

    updatePlotSettings = (plotID, settings) => {
        this._plotMethod(plotID, "update_settings", settings)
    }

    undoPlotSettings = (plotID) => {
        this._plotMethod(plotID, "undo_settings")
    }

    updatePlotLayout = (plotID, layoutUpdates) => {
        this._plotMethod(plotID, "update_layout", layoutUpdates)
    }

    updateFigure = (plotID, {layout, data, frames, overwrite}) => {
        this._plotMethod(plotID, "update", {layout, data, frames, overwrite})
    }

    callPlotShortcut = (plotID, sequence) => {
        this._plotMethod(plotID, "call_shortcut", null, null, sequence)
    }

    dispatchPlotEvent = (plotID, event, data) => {
        this._plotMethod(plotID, 'dispatch_event', data, null, event)
    }

    sendFile = (file) => {
        this.socket.emit("upload_file", file, file.name)
    }

}

export default new PythonApi();