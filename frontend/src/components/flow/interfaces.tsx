import { 
    XYPosition,
    Dimensions
} from 'reactflow';

export interface NodePositions {
    [key: string]: XYPosition
}

export interface NodeDimensions {
    [key: string]: Dimensions
}