import { Viewport } from "reactflow"
import { FieldType } from "../components/input_fields"

export type ParameterKind = "POSITIONAL_ONLY" | "POSITIONAL_OR_KEYWORD" | "VAR_POSITIONAL" | "KEYWORD_ONLY" | "VAR_KEYWORD"

export interface Parameter {
    name: string,
    kind: ParameterKind,
    typehint?: number,
    default?: any,
    help?: string
}

export interface NodeClass {
    name: string,
    id: number,
    module: string,
    parameters: {
        [key: string]: Parameter
    },
    return_typehint?: number,
    output_type?: any,
    doc?: string,
    registry?: any
}

export interface Node {
    class: number,
    id: number,
    inputs: { [key: string]: any },
    inputs_mode: { [key: string]: string },
    output: any,
    output_class: any,
    output_class_id?: number,
    output_links: number[],
    last_log: number,
    logs?: string,
    outdated: boolean,
    errored: boolean,
    output_repr?: {
        type: "text" | "plotlyfigure" | "html",
        data: any
    }
}

export interface Flow {
    nodes: number[],
    positions: {
        [key: string]: {
            x: number,
            y: number
        }
    },
    dimensions: {
        [key: string]: {
            width: number,
            height: number
        }
    },
    expanded: {
        [key: string]: boolean
    },
    output_visible: {
        [key: string]: boolean
    },
    viewport?: Viewport
}

export interface Nodes {
    [key: number]: {
        name: string,
        node: Node
    }
}

export interface TypeRegistry {
    first_arg: number[],
    arg: number[],
    return: number[],
    creators: number[],
    modifiers: number[]
}

export interface Typehint {
    name: string,
    module: string | null,
    id: number,
    input_type: FieldType,
    field_params: {[key: string]: any}
}

export interface NodeClassesRegistry {
    node_classes: {[key: number]: NodeClass},
    types_registry: {[key: string]: TypeRegistry},
    typehints: {[key: number]: Typehint}
}

export interface Session {
    nodes: Nodes,
    flows: {
        [key: string]: Flow
    },
    node_classes_registry: NodeClassesRegistry,
    logs: string,
}

export interface SessionLastUpdates {
    nodes: number,
    flows: number,
    node_classes: number,
}
