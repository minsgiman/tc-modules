export interface IClipPlayInfo {
    elId: string,
    videoUrl: string,
    durationStr: string,
    clipStatus: string,
    thumbnailPath: string,
    startTime: number,
    endTime: number,
    eventHandler?: Function
}