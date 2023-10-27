export type ParameterKind = "POSITIONAL_ONLY" | "POSITIONAL_OR_KEYWORD" | "VAR_POSITIONAL" | "KEYWORD_ONLY" | "VAR_KEYWORD"

export interface Parameter {
    name: string,
    kind: ParameterKind,
    type?: string,
    default?: any,
    help?: string
}

export interface NodeClass {
    name: string,
    id: number,
    module: string,
    parameters: {
        [key: string]: Parameter
    }
    output_type?: any,
    doc?: string,
}

export interface Node {
    class: number,
    id: number,
    inputs: { [key: string]: any },
    inputs_mode: { [key: string]: string },
    output: any,
    output_class: any,
    logs: string,
    outdated: boolean,
    errored: boolean,
    output_repr?: {
        type: "text" | "plotlyfigure" | "html",
        data: any
    }
}

export interface Session {
    nodes: {
        [key: number]: {
            name: string,
            node: Node
        }
    },
    node_classes: {
        [key: number]: NodeClass
    },
    paths: string[],
    logs: string
}
