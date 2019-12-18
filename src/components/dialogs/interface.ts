export interface IConfDlgParam {
    elId: string,
    dlgStyle?: any,
    title?: string,
    theme?: string,
    pCheckList?: any[],
    description?: string,
    noCloseBtn?: boolean,
    btns: any[],
    eventHandler?: (event: any) => void
}

export interface IPlayerTipDlgParam {
    elId: string,
    dlgStyle?: any,
    txtMap: any,
    eventHandler?: (event: any) => void
}

export interface IVideoDlgParam {
    elId: string,
    dlgStyle?: any,
    webmUrl?: string,
    mp4Url?: string,
    eventHandler?: (event: any) => void
}

export interface IAiGraphsDlgParam {
    elId: string,
    dlgStyle?: any,
    txtMap: any,
    aiCameraList: any,
    pRequestCamCharts: any,
    pRequestShopChart: any,
    eventHandler?: (event: any) => void
}

export interface IAiCameraSummary {
    cameraId: string,
    cameraName: string,
    totalInPeopleZone: number,
    useTableCount: number,
    allTableCount: number,
    aiThumbnail: string
}

export interface IAiStatsDlgParam {
    elId: string,
    dlgStyle?: any,
    txtMap: any,
    pUpdateDate: number,
    pCameraSummaries: IAiCameraSummary[],
    eventHandler?: (event: any) => void
}

export interface ICameraInfo {
    id: string,
    labelName: string
}

export interface IAiChart {
    data: string[],
    yAxis: IYAxis,
    xAxis: IXAxis
}

export interface IYAxis {
    min: number,
    max: number
}

export interface IXAxis {
    items: string[]
}