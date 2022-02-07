import ConfigurableObjectInterface from "./configurable";
import { ShortcutsInterface } from "./shortcuts";

export interface TabInterface {
    id: string,
    name: string,
    plots: string[],
    layouts?: {
        lg: any[],
        [key:string]: any //More s
    }
}

export interface StructureInterface {
    id: string,
    name: string,
    path: string,
}

export interface PlotableInterface {
    id: string,
    name: string,
    path: string,
    plots: string[],
    default_plot: string,
}

export interface StructOrPlotableInterface extends StructureInterface{
    plots?: string[],
    default_plot?: string,
}

export interface SessionInterface extends ConfigurableObjectInterface{
    sessionClass: string,
    tabs: TabInterface[],
    updatesAvailable: boolean,
    plotOptions: {value: string, label:string}[],
    structures: {[key:string]: StructureInterface},
    plotables: { [key: string]: PlotableInterface },
    shortcuts: ShortcutsInterface,
}

export default SessionInterface;
