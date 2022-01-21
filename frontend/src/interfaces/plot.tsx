import ConfigurableObjectInterface from "./configurable";
import { ShortcutsInterface } from "./shortcuts";

export interface PlotlyFigureInterface { // Until I find out that plotly provides this.
    data: {[key: string]: any}[]
    layout: {[key: string]: any}
    frames: any, 
}

export interface PlotInterface extends ConfigurableObjectInterface {
    plotClass: string,
    struct: string | undefined,
    figure: PlotlyFigureInterface | undefined,
    grid_dims?: any,
    shortcuts: ShortcutsInterface,
}

export default PlotInterface;