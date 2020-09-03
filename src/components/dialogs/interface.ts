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
    shopRegdate: number,
    txtMap: any,
    pRequestShopChart: any,
    sundayFirst?: boolean,
    eventHandler?: (event: any) => void
}

export interface IAiCameraSummary {
    id: string,
    labelName: string,
    aiCountSummary: IAiCountSummary,
    aiThumbnail: string,
}

export interface IAiCountSummary {
    useTableCount: number,
    allTableCount: number,
    allPeopleZoneCount: number,
    totalInPeopleZone: number,
    updateDate: number
}

export interface IAiStatsDlgParam {
    elId: string,
    dlgStyle?: any,
    txtMap: any,
    pCameraSummaries: IAiCameraSummary[],
    eventHandler?: (event: any) => void
}

export interface IAiZoneGuideDlgParam {
    elId: string,
    dlgStyle?: any,
    txtMap: any,
    swipeInfos: ISwipeInfo[],
    noCloseBtn?: boolean,
    eventHandler?: (event: any) => void
}

export interface ICameraInfo {
    id: string,
    labelName: string
}

export interface ISwipeInfo {
    imgUrl: string,
    description: string
}

export interface IAiChart {
    data: any[],
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