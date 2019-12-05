export interface ICamInfo {
    id: string,
    recorderType: string,
    recordType: string,
    streamStatusConfig: string,
    controlStatus: string,
    streamStatus: string,
    thumbnailPath: string,
    labelName: string
}

export interface ICamListInfo {
    elId: string,
    list: ICamInfo[],
    focusId?: string,
    eventHandler?: (event: any) => void
}