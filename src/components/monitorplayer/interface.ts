export interface IMonitorPlayInfo {
    elId: string,
    width: number,
    height: number,
    cameras: any[],
    dimension: number,
    eventHandler?: (event: any) => void
}