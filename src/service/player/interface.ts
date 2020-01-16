export interface IStoreState {
    category: string,
    cameraData: any,
    cameraConfig: any,
    shopId: string,
    isShared: boolean,
    isFullScreen: boolean,
    dataLoadingStatus: boolean,
    isPlaying: boolean,
    isLive: boolean,
    playBtnStatus: boolean,
    serviceDay: number,
    currentTime: Date,
    timezone: string,
    timeRange: number,
    cvrData: any[],
    arrEvents: any[],
    inoutFilter: boolean,
    sensorZones: any[],
    eventZones: any[],
    motionZones: any[],
    currentDomain: any,
    isShowTimelineCalendar: boolean,
    ptzControlMode: boolean
}