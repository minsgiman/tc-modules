export interface IMonitorPlayInfo {
    elId: string,
    width: number,
    height: number,
    commonToken: string,
    serverUrls: string[],
    streamType: string,
    cameras: any[],
    dimension: number,
    eventHandler?: (event: any) => void
}

export interface ICameraInfo {
    cameraId: string,
    labelName: string,
    cameraModelId: string,
    recordType: string,
    categoryList: string[],
    controlStatus: string,
    streamStatus: string,
    streamStatusConfig: string,
    streamServer: string,
    subStreamServer: string,
    motionStatus: string,
    motionTimestamp: number
}