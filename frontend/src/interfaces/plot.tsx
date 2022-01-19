import ConfigurableObjectInterface from "./configurable";

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
    shortcuts: {
        [key: string]: {
            name: string,
            description: string,
        },
    }
}

export default PlotInterface;