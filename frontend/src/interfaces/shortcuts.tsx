export interface ShortCutInterface {
    name: string,
    description: string,
}

export interface ShortcutsInterface {
    [key: string]: ShortCutInterface,
}