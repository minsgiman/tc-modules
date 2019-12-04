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