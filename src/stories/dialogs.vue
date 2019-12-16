<template>
    <div class="dlg_test">
        <div id="dlgId"></div>
        <button class="dlg-btn" @click="createPlayerTipDlg">Show player-tip-dialog</button>
        <button class="dlg-btn" @click="createVideoPlayDlg">Show video-play-dialog</button>
        <button class="dlg-btn" @click="createConfirmDlg('normal')">Show confirm-dialog (normal)</button>
        <button class="dlg-btn" @click="createConfirmDlg('center')">Show confirm-dialog (center)</button>
        <button class="dlg-btn" @click="createConfirmDlg('checker')">Show confirm-dialog (checker)</button>
        <button class="dlg-btn" @click="createAiStatsDialog">Show ai-stats-dialog</button>
        <button class="dlg-btn" @click="createAiGraphsDialog">Show ai-graphs-dialog</button>
    </div>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { playerTipDialog, videoPlayDialog, confirmDialog, aiStatsDialog, aiGraphsDialog } from './../components/dialogs';

    @Component
    export default class Checkbox extends Vue {
        playerTipDlg: any = null;
        videoPlayDlg: any = null;
        confirmDlg: any = null;
        aiStatsDlg: any = null;
        aiGraphsDlg: any = null;

        createAiStatsDialog () {
            this.aiStatsDlg = aiStatsDialog({
                elId: 'dlgId',
                dlgStyle: {
                    width: '800px', height: '667px', padding: '32px', boxSizing: 'border-box'
                },
                txtMap: {
                    title : '카메라별 혼잡도',
                    countUnit : '명',
                    seatUnit : '석'
                },
                pCameraStats: [{"statsPerHour":{"0":{"key":0,"cameraId":"AAADIYJ","count":159663,"objMax":2,"objMin":0,"objSum":9909,"peopleMax":2,"peopleMin":0,"peopleSum":8634,"seatMax":2,"seatMin":0,"seatSum":5245},"1":{"key":1,"cameraId":"AAADIYJ","count":157333,"objMax":3,"objMin":0,"objSum":10202,"peopleMax":3,"peopleMin":0,"peopleSum":8554,"seatMax":2,"seatMin":0,"seatSum":5372},"2":{"key":2,"cameraId":"AAADIYJ","count":158010,"objMax":5,"objMin":0,"objSum":12323,"peopleMax":4,"peopleMin":0,"peopleSum":10177,"seatMax":5,"seatMin":0,"seatSum":7096},"3":{"key":3,"cameraId":"AAADIYJ","count":155494,"objMax":4,"objMin":0,"objSum":11929,"peopleMax":3,"peopleMin":0,"peopleSum":9710,"seatMax":4,"seatMin":0,"seatSum":6411},"4":{"key":4,"cameraId":"AAADIYJ","count":154755,"objMax":3,"objMin":0,"objSum":10197,"peopleMax":3,"peopleMin":0,"peopleSum":8766,"seatMax":3,"seatMin":0,"seatSum":5348},"5":{"key":5,"cameraId":"AAADIYJ","count":153690,"objMax":2,"objMin":0,"objSum":9532,"peopleMax":2,"peopleMin":0,"peopleSum":8270,"seatMax":2,"seatMin":0,"seatSum":4880},"6":{"key":6,"cameraId":"AAADIYJ","count":151826,"objMax":2,"objMin":0,"objSum":7675,"peopleMax":2,"peopleMin":0,"peopleSum":7470,"seatMax":2,"seatMin":0,"seatSum":5230},"7":{"key":7,"cameraId":"AAADIYJ","count":154050,"objMax":2,"objMin":0,"objSum":6594,"peopleMax":2,"peopleMin":0,"peopleSum":6307,"seatMax":2,"seatMin":0,"seatSum":3060},"8":{"key":8,"cameraId":"AAADIYJ","count":154744,"objMax":3,"objMin":0,"objSum":7266,"peopleMax":3,"peopleMin":0,"peopleSum":6596,"seatMax":3,"seatMin":0,"seatSum":3024},"9":{"key":9,"cameraId":"AAADIYJ","count":152060,"objMax":8,"objMin":0,"objSum":22379,"peopleMax":8,"peopleMin":0,"peopleSum":20904,"seatMax":7,"seatMin":0,"seatSum":11992},"10":{"key":10,"cameraId":"AAADIYJ","count":155049,"objMax":11,"objMin":0,"objSum":99992,"peopleMax":9,"peopleMin":0,"peopleSum":82904,"seatMax":8,"seatMin":0,"seatSum":46657},"11":{"key":11,"cameraId":"AAADIYJ","count":151734,"objMax":17,"objMin":0,"objSum":767354,"peopleMax":15,"peopleMin":0,"peopleSum":593759,"seatMax":13,"seatMin":0,"seatSum":329743},"12":{"key":12,"cameraId":"AAADIYJ","count":149301,"objMax":20,"objMin":0,"objSum":943520,"peopleMax":14,"peopleMin":0,"peopleSum":715925,"seatMax":15,"seatMin":0,"seatSum":417416},"13":{"key":13,"cameraId":"AAADIYJ","count":147095,"objMax":19,"objMin":0,"objSum":927499,"peopleMax":15,"peopleMin":0,"peopleSum":705719,"seatMax":16,"seatMin":0,"seatSum":418797},"14":{"key":14,"cameraId":"AAADIYJ","count":162670,"objMax":16,"objMin":0,"objSum":351296,"peopleMax":13,"peopleMin":0,"peopleSum":254285,"seatMax":13,"seatMin":0,"seatSum":161024},"15":{"key":15,"cameraId":"AAADIYJ","count":166734,"objMax":13,"objMin":0,"objSum":113675,"peopleMax":11,"peopleMin":0,"peopleSum":93676,"seatMax":10,"seatMin":0,"seatSum":67717},"16":{"key":16,"cameraId":"AAADIYJ","count":165131,"objMax":7,"objMin":0,"objSum":86282,"peopleMax":6,"peopleMin":0,"peopleSum":76931,"seatMax":5,"seatMin":0,"seatSum":49298},"17":{"key":17,"cameraId":"AAADIYJ","count":155518,"objMax":18,"objMin":0,"objSum":863935,"peopleMax":14,"peopleMin":0,"peopleSum":670429,"seatMax":15,"seatMin":0,"seatSum":383569},"18":{"key":18,"cameraId":"AAADIYJ","count":154097,"objMax":19,"objMin":0,"objSum":938336,"peopleMax":14,"peopleMin":0,"peopleSum":718286,"seatMax":14,"seatMin":0,"seatSum":422647},"19":{"key":19,"cameraId":"AAADIYJ","count":155925,"objMax":18,"objMin":0,"objSum":984255,"peopleMax":15,"peopleMin":0,"peopleSum":742810,"seatMax":14,"seatMin":0,"seatSum":434973},"20":{"key":20,"cameraId":"AAADIYJ","count":155665,"objMax":17,"objMin":0,"objSum":639070,"peopleMax":13,"peopleMin":0,"peopleSum":476098,"seatMax":12,"seatMin":0,"seatSum":284726},"21":{"key":21,"cameraId":"AAADIYJ","count":159240,"objMax":10,"objMin":0,"objSum":121831,"peopleMax":10,"peopleMin":0,"peopleSum":100301,"seatMax":8,"seatMin":0,"seatSum":65970},"22":{"key":22,"cameraId":"AAADIYJ","count":163258,"objMax":7,"objMin":0,"objSum":13058,"peopleMax":6,"peopleMin":0,"peopleSum":11330,"seatMax":3,"seatMin":0,"seatSum":8374},"23":{"key":23,"cameraId":"AAADIYJ","count":160541,"objMax":2,"objMin":0,"objSum":8539,"peopleMax":2,"peopleMin":0,"peopleSum":7518,"seatMax":2,"seatMin":0,"seatSum":5877}},"currentPeopleCount":"1","cameraId":"AAADIYJ","currentSeatedCount":"0","statsPerDayOfWeek":{"1":{"key":1,"cameraId":"AAADIYJ","count":537776,"objMax":18,"objMin":0,"objSum":1065248,"peopleMax":15,"peopleMin":0,"peopleSum":812690,"seatMax":14,"seatMin":0,"seatSum":497604},"2":{"key":2,"cameraId":"AAADIYJ","count":558091,"objMax":16,"objMin":0,"objSum":978984,"peopleMax":14,"peopleMin":0,"peopleSum":760146,"seatMax":13,"seatMin":0,"seatSum":460526},"3":{"key":3,"cameraId":"AAADIYJ","count":569079,"objMax":19,"objMin":0,"objSum":1024910,"peopleMax":15,"peopleMin":0,"peopleSum":782904,"seatMax":16,"seatMin":0,"seatSum":468958},"4":{"key":4,"cameraId":"AAADIYJ","count":519355,"objMax":17,"objMin":0,"objSum":953376,"peopleMax":15,"peopleMin":0,"peopleSum":731452,"seatMax":14,"seatMin":0,"seatSum":408615},"5":{"key":5,"cameraId":"AAADIYJ","count":522079,"objMax":18,"objMin":0,"objSum":939433,"peopleMax":14,"peopleMin":0,"peopleSum":720360,"seatMax":13,"seatMin":0,"seatSum":404665},"6":{"key":6,"cameraId":"AAADIYJ","count":517755,"objMax":19,"objMin":0,"objSum":965656,"peopleMax":15,"peopleMin":0,"peopleSum":736612,"seatMax":14,"seatMin":0,"seatSum":430845},"7":{"key":7,"cameraId":"AAADIYJ","count":529448,"objMax":20,"objMin":0,"objSum":1039041,"peopleMax":14,"peopleMin":0,"peopleSum":801195,"seatMax":15,"seatMin":0,"seatSum":483233}},"cameraName":"롤파_내부","last10Record":[{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958142826.jpg","objects":[{"index":1,"confidence":52,"coordinate":"278,232,99,207"}],"regDate":1575958142826,"isoDateString":"2019-12-10T15:09:02+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":2},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958146053.jpg","objects":[{"index":1,"confidence":71,"coordinate":"280,229,95,208"}],"regDate":1575958146053,"isoDateString":"2019-12-10T15:09:06+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":6},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958149962.jpg","objects":[],"regDate":1575958149962,"isoDateString":"2019-12-10T15:09:09+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":9},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958153188.jpg","objects":[{"index":1,"confidence":65,"coordinate":"280,228,93,212"}],"regDate":1575958153188,"isoDateString":"2019-12-10T15:09:13+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":13},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958156924.jpg","objects":[{"index":1,"confidence":71,"coordinate":"279,229,96,203"}],"regDate":1575958156924,"isoDateString":"2019-12-10T15:09:16+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":16},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958159756.jpg","objects":[{"index":1,"confidence":64,"coordinate":"280,229,93,209"}],"regDate":1575958159756,"isoDateString":"2019-12-10T15:09:19+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":19},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958162796.jpg","objects":[{"index":1,"confidence":54,"coordinate":"280,229,93,208"}],"regDate":1575958162796,"isoDateString":"2019-12-10T15:09:22+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":22},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958165719.jpg","objects":[{"index":1,"confidence":56,"coordinate":"279,230,95,207"}],"regDate":1575958165719,"isoDateString":"2019-12-10T15:09:25+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":25},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958168629.jpg","objects":[{"index":1,"confidence":50,"coordinate":"281,230,94,202"}],"regDate":1575958168629,"isoDateString":"2019-12-10T15:09:28+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":28},{"cameraId":"AAADIYJ","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":1,"people_count":1,"seated_count":0,"people_zone":"1,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYJ/event/ai1575958172659.jpg","objects":[{"index":1,"confidence":66,"coordinate":"279,230,97,206"}],"regDate":1575958172659,"isoDateString":"2019-12-10T15:09:32+0900","dayOfWeek":3,"month":12,"year":2019,"dayOfMonth":10,"hour":15,"minute":9,"second":32}],"$$hashKey":"object:37633"},{"statsPerHour":{"0":{"key":0,"cameraId":"AAADIYK","count":142209,"objMax":6,"objMin":0,"objSum":29623,"peopleMax":4,"peopleMin":0,"peopleSum":15640,"seatMax":2,"seatMin":0,"seatSum":3594},"1":{"key":1,"cameraId":"AAADIYK","count":143093,"objMax":4,"objMin":0,"objSum":27928,"peopleMax":4,"peopleMin":0,"peopleSum":12978,"seatMax":2,"seatMin":0,"seatSum":2428},"2":{"key":2,"cameraId":"AAADIYK","count":142015,"objMax":4,"objMin":0,"objSum":28627,"peopleMax":4,"peopleMin":0,"peopleSum":14293,"seatMax":2,"seatMin":0,"seatSum":2828},"3":{"key":3,"cameraId":"AAADIYK","count":141554,"objMax":3,"objMin":0,"objSum":28314,"peopleMax":3,"peopleMin":0,"peopleSum":14005,"seatMax":2,"seatMin":0,"seatSum":2486},"4":{"key":4,"cameraId":"AAADIYK","count":141472,"objMax":3,"objMin":0,"objSum":27672,"peopleMax":3,"peopleMin":0,"peopleSum":12684,"seatMax":2,"seatMin":0,"seatSum":2176},"5":{"key":5,"cameraId":"AAADIYK","count":141567,"objMax":3,"objMin":0,"objSum":27170,"peopleMax":2,"peopleMin":0,"peopleSum":13392,"seatMax":2,"seatMin":0,"seatSum":3129},"6":{"key":6,"cameraId":"AAADIYK","count":141360,"objMax":5,"objMin":0,"objSum":17064,"peopleMax":5,"peopleMin":0,"peopleSum":12173,"seatMax":3,"seatMin":0,"seatSum":2697},"7":{"key":7,"cameraId":"AAADIYK","count":141550,"objMax":3,"objMin":0,"objSum":13253,"peopleMax":3,"peopleMin":0,"peopleSum":12195,"seatMax":2,"seatMin":0,"seatSum":6037},"8":{"key":8,"cameraId":"AAADIYK","count":140851,"objMax":3,"objMin":0,"objSum":15895,"peopleMax":3,"peopleMin":0,"peopleSum":15862,"seatMax":2,"seatMin":0,"seatSum":13734},"9":{"key":9,"cameraId":"AAADIYK","count":139690,"objMax":9,"objMin":0,"objSum":54541,"peopleMax":9,"peopleMin":0,"peopleSum":53758,"seatMax":4,"seatMin":0,"seatSum":33530},"10":{"key":10,"cameraId":"AAADIYK","count":136740,"objMax":11,"objMin":0,"objSum":289938,"peopleMax":11,"peopleMin":0,"peopleSum":284095,"seatMax":4,"seatMin":0,"seatSum":133303},"11":{"key":11,"cameraId":"AAADIYK","count":135037,"objMax":24,"objMin":0,"objSum":1260125,"peopleMax":24,"peopleMin":0,"peopleSum":1257955,"seatMax":4,"seatMin":0,"seatSum":325913},"12":{"key":12,"cameraId":"AAADIYK","count":134885,"objMax":24,"objMin":0,"objSum":1608327,"peopleMax":24,"peopleMin":0,"peopleSum":1604601,"seatMax":4,"seatMin":0,"seatSum":402501},"13":{"key":13,"cameraId":"AAADIYK","count":134992,"objMax":23,"objMin":0,"objSum":1584478,"peopleMax":23,"peopleMin":0,"peopleSum":1581479,"seatMax":4,"seatMin":0,"seatSum":400787},"14":{"key":14,"cameraId":"AAADIYK","count":137058,"objMax":21,"objMin":0,"objSum":706298,"peopleMax":21,"peopleMin":0,"peopleSum":703015,"seatMax":4,"seatMin":0,"seatSum":229438},"15":{"key":15,"cameraId":"AAADIYK","count":140199,"objMax":11,"objMin":0,"objSum":261447,"peopleMax":11,"peopleMin":0,"peopleSum":259032,"seatMax":4,"seatMin":0,"seatSum":132695},"16":{"key":16,"cameraId":"AAADIYK","count":138881,"objMax":10,"objMin":0,"objSum":240172,"peopleMax":10,"peopleMin":0,"peopleSum":235494,"seatMax":4,"seatMin":0,"seatSum":118907},"17":{"key":17,"cameraId":"AAADIYK","count":134577,"objMax":26,"objMin":0,"objSum":1434804,"peopleMax":26,"peopleMin":0,"peopleSum":1427294,"seatMax":4,"seatMin":0,"seatSum":364152},"18":{"key":18,"cameraId":"AAADIYK","count":134950,"objMax":25,"objMin":0,"objSum":1612696,"peopleMax":25,"peopleMin":0,"peopleSum":1604793,"seatMax":4,"seatMin":0,"seatSum":412877},"19":{"key":19,"cameraId":"AAADIYK","count":134500,"objMax":25,"objMin":0,"objSum":1569772,"peopleMax":25,"peopleMin":0,"peopleSum":1560800,"seatMax":4,"seatMin":0,"seatSum":408129},"20":{"key":20,"cameraId":"AAADIYK","count":134794,"objMax":23,"objMin":0,"objSum":1090573,"peopleMax":22,"peopleMin":0,"peopleSum":1081607,"seatMax":4,"seatMin":0,"seatSum":319441},"21":{"key":21,"cameraId":"AAADIYK","count":135643,"objMax":13,"objMin":0,"objSum":300806,"peopleMax":13,"peopleMin":0,"peopleSum":278179,"seatMax":4,"seatMin":0,"seatSum":124133},"22":{"key":22,"cameraId":"AAADIYK","count":138896,"objMax":11,"objMin":0,"objSum":45602,"peopleMax":11,"peopleMin":0,"peopleSum":34257,"seatMax":4,"seatMin":0,"seatSum":18101},"23":{"key":23,"cameraId":"AAADIYK","count":139752,"objMax":5,"objMin":0,"objSum":32546,"peopleMax":5,"peopleMin":0,"peopleSum":21463,"seatMax":2,"seatMin":0,"seatSum":7485}},"currentPeopleCount":"-","cameraId":"AAADIYK","currentSeatedCount":"-","statsPerDayOfWeek":{"1":{"key":1,"cameraId":"AAADIYK","count":467079,"objMax":26,"objMin":0,"objSum":1837169,"peopleMax":26,"peopleMin":0,"peopleSum":1815080,"seatMax":4,"seatMin":0,"seatSum":512960},"2":{"key":2,"cameraId":"AAADIYK","count":476292,"objMax":25,"objMin":0,"objSum":1735781,"peopleMax":25,"peopleMin":0,"peopleSum":1709468,"seatMax":4,"seatMin":0,"seatSum":488302},"3":{"key":3,"cameraId":"AAADIYK","count":495466,"objMax":23,"objMin":0,"objSum":1904735,"peopleMax":23,"peopleMin":0,"peopleSum":1883784,"seatMax":4,"seatMin":0,"seatSum":553705},"4":{"key":4,"cameraId":"AAADIYK","count":472927,"objMax":25,"objMin":0,"objSum":1690963,"peopleMax":25,"peopleMin":0,"peopleSum":1661625,"seatMax":4,"seatMin":0,"seatSum":480854},"5":{"key":5,"cameraId":"AAADIYK","count":470437,"objMax":24,"objMin":0,"objSum":1676785,"peopleMax":24,"peopleMin":0,"peopleSum":1644024,"seatMax":4,"seatMin":0,"seatSum":472038},"6":{"key":6,"cameraId":"AAADIYK","count":472153,"objMax":24,"objMin":0,"objSum":1671634,"peopleMax":23,"peopleMin":0,"peopleSum":1644160,"seatMax":4,"seatMin":0,"seatSum":473250},"7":{"key":7,"cameraId":"AAADIYK","count":471911,"objMax":25,"objMin":0,"objSum":1790604,"peopleMax":24,"peopleMin":0,"peopleSum":1752903,"seatMax":4,"seatMin":0,"seatSum":489392}},"cameraName":"롤파_중앙","last10Record":[{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575404922921,"isoDateString":"2019-12-04T05:28:42+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":28,"second":42},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575404929733,"isoDateString":"2019-12-04T05:28:49+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":28,"second":49},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYK/event/ai1575404939162.jpg","objects":[],"regDate":1575404939162,"isoDateString":"2019-12-04T05:28:59+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":28,"second":59},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYK/event/ai1575404947896.jpg","objects":[],"regDate":1575404947896,"isoDateString":"2019-12-04T05:29:07+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":29,"second":7},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575404951615,"isoDateString":"2019-12-04T05:29:11+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":29,"second":11},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"https://beta-bizcam.toast.com/AAADIYK/event/ai1575404981363.jpg","objects":[],"regDate":1575404981363,"isoDateString":"2019-12-04T05:29:41+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":29,"second":41},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575404991082,"isoDateString":"2019-12-04T05:29:51+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":29,"second":51},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575405000951,"isoDateString":"2019-12-04T05:30:00+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":30,"second":0},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575405007061,"isoDateString":"2019-12-04T05:30:07+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":30,"second":7},{"cameraId":"AAADIYK","shopId":"de426baa-30eb-4195-8dde-608bb268ad48","complexity":0,"object_count":0,"people_count":0,"seated_count":0,"people_zone":"0,0,0,0","seat_table":"0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0","thumbnail":"","objects":[],"regDate":1575405017190,"isoDateString":"2019-12-04T05:30:17+0900","dayOfWeek":4,"month":12,"year":2019,"dayOfMonth":4,"hour":5,"minute":30,"second":17}],"$$hashKey":"object:37634"}],
                eventHandler: (event) => {
                }
            });
        }

        createAiGraphsDialog () {
            const aiGraphObject = {
                startDate: new Date(),
                endDate: new Date(),
                mode: 'hourly'
            };

            this.aiGraphsDlg = aiGraphsDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '1100px', height: '720px', boxSizing: 'border-box'
                },
                'txtMap' : {
                    title : '혼잡도 그래프',
                    weekly : '주간',
                    daily : '일일',
                    today : '오늘',
                    hour : '시간',
                    min : '분',
                    man : '인원',
                    manCount : '명',
                    hourCount : '시',
                    dayMap : ['일', '월', '화', '수', '목', '금', '토']
                },
                'pAiStartTime' : 0,
                'pAiEndTime' : 0,
                'pAiIs24Hours' : false,
                'pShopStats' : [{"key":2019121000,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1278,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121001,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1265,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121002,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1277,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121003,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1277,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121004,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1275,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121005,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1282,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121006,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1274,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121007,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1244,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121008,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1227,"objMax":0,"objMin":-1,"objSum":0,"peopleMax":0,"peopleMin":-1,"peopleSum":0,"seatMax":0,"seatMin":-1,"seatSum":0},{"key":2019121009,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1214,"objMax":2,"objMin":-1,"objSum":45,"peopleMax":2,"peopleMin":-1,"peopleSum":27,"seatMax":1,"seatMin":-1,"seatSum":22},{"key":2019121010,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1188,"objMax":5,"objMin":0,"objSum":1098,"peopleMax":4,"peopleMin":-1,"peopleSum":688,"seatMax":3,"seatMin":-1,"seatSum":633},{"key":2019121011,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1134,"objMax":10,"objMin":0,"objSum":3117,"peopleMax":8,"peopleMin":0,"peopleSum":1820,"seatMax":4,"seatMin":0,"seatSum":1573},{"key":2019121012,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1092,"objMax":12,"objMin":0,"objSum":6566,"peopleMax":8,"peopleMin":0,"peopleSum":4281,"seatMax":4,"seatMin":0,"seatSum":3049},{"key":2019121013,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1035,"objMax":8,"objMin":0,"objSum":4079,"peopleMax":7,"peopleMin":0,"peopleSum":3196,"seatMax":4,"seatMin":0,"seatSum":1989},{"key":2019121014,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":1158,"objMax":6,"objMin":0,"objSum":1049,"peopleMax":5,"peopleMin":-1,"peopleSum":613,"seatMax":3,"seatMin":-1,"seatSum":556},{"key":2019121015,"cameraId":"AAADIYJ,AAADIYK,AAADIYJ,AAADIYK,AAADIYJ,AAADIYK","count":383,"objMax":3,"objMin":-1,"objSum":209,"peopleMax":3,"peopleMin":-1,"peopleSum":209,"seatMax":2,"seatMin":-1,"seatSum":26}],
                'pAiGraphObject' : aiGraphObject,
                'pRequestShopStats' : function(mode: string, startDate: Date, endDate: Date) {
                    /*
                    if (mode === 'hourly') {
                        return Shop.aiHourlyStats({shopId: $scope.shopId, start: getDateString(startDate), end: getDateString(endDate), count: 1}).$promise;
                    } else if (mode === 'min') {
                        var startDateStr = getDateString(startDate), endDateStr = getDateString(endDate);
                        if (aiIs24Hours) {
                            startDateStr = startDateStr + '-00';
                            endDateStr = endDateStr + '-23';
                        } else {
                            startDateStr = startDateStr + '-' + (aiStartTime < 10 ? '0' + aiStartTime : aiStartTime);
                            endDateStr = endDateStr + '-' + (aiEndTime < 10 ? '0' + aiEndTime : aiEndTime);
                        }
                        return Shop.aiMinStats({shopId: $scope.shopId, start: startDateStr, end: endDateStr, count: 1}).$promise;
                    } else {
                        return Shop.aiDailyStats({shopId: $scope.shopId, start: getDateString(startDate), end: getDateString(endDate)}).$promise;
                    }
                     */
                },
                'pRequestCamStats' : function(camIds: string[], mode: string, startDate: Date, endDate: Date) {
                    /*
                    var i, len = camIds.length, promiseMap = {};
                    var startDateStr = getDateString(startDate), endDateStr = getDateString(endDate);
                    if (mode === 'min') {
                        if (aiIs24Hours) {
                            startDateStr = startDateStr + '-00';
                            endDateStr = endDateStr + '-23';
                        } else {
                            startDateStr = startDateStr + '-' + (aiStartTime < 10 ? '0' + aiStartTime : aiStartTime);
                            endDateStr = endDateStr + '-' + (aiEndTime < 10 ? '0' + aiEndTime : aiEndTime);
                        }
                    }
                    for (i = 0; i < len; i+=1) {
                        if (mode === 'hourly') {
                            promiseMap[camIds[i]] = Camera.aiHourlyStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        } else if (mode === 'min') {
                            promiseMap[camIds[i]] = Camera.aiMinStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        } else {
                            promiseMap[camIds[i]] = Camera.aiDailyStats({cameraId: camIds[i], start: startDateStr, end: endDateStr}).$promise;
                        }
                    }
                    return promiseMap;
                     */
                },
                'pGetCameraName' : function(camId: string) {
                    /*
                    if (aiStats) {
                        var i, len = aiStats.length;
                        for (i = 0; i < len; i+=1) {
                            if (aiStats[i].cameraId === camId) {
                                return aiStats[i].cameraName;
                            }
                        }
                    }
                    return '';
                    */
                }
            });
        }

        createPlayerTipDlg () {
            this.playerTipDlg = playerTipDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '500px', height: '610px', padding: '24px', boxSizing: 'border-box', overflow: 'auto'
                },
                txtMap : {
                    title : 'title Str',
                    guideKeyFb : 'guideKeyFb line1 Str<br>guideKeyFb line2 Str',
                    guideKeySpace : 'guideKeySpace Str',
                    confirm : 'confirm Str'
                },
                eventHandler: (event: any) => {
                    console.log(event);
                }
            });
        }

        createVideoPlayDlg () {
            this.videoPlayDlg = videoPlayDialog({
                elId: 'dlgId',
                dlgStyle : {
                    width: '1180px', height: '730px', padding: '60px', boxSizing: 'border-box', overflow: 'auto'
                },
                webmUrl : 'https://bizcam.toast.com/CF/video/biz_app_final.webm',
                mp4Url : 'https://bizcam.toast.com/CF/video/biz_app_final.mp4'
            });
        }

        createConfirmDlg (type: string) {
            if (type === 'center') {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '482px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    theme : 'center',
                    title : '매장을 공유하면 해당 카메라들에 대한<br>클라우드 모니터 기능도 함께 공유됩니다.',
                    description : '공유를 진행하시겠습니까?',
                    btns : [{name: 'cancel', text: '취소', class: 'white'}, {name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        this.confirmDlg.destroy();
                    }
                });
            } else if (type === 'checker') {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '460px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    theme : 'checker',
                    title : '공유설정 변경',
                    pCheckList : [
                        { id: 1, text: '영상,센서/도어락 이벤트 (필수)', value: true, disabled: true },
                        { id: 2, text: '클립&타임랩스', value: true },
                        { id: 3, text: '근태관리기록', value: false },
                        { id: 4, text: '매출관리기록', value: false },
                        { id: 5, text: 'DID 컨텐츠', value: false }
                    ],
                    btns : [{name: 'cancel', text: '취소', class: 'white'}, {name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        this.confirmDlg.destroy();
                    }
                });
            } else {
                this.confirmDlg = confirmDialog({
                    elId: 'dlgId',
                    dlgStyle : {
                        width: '450px', padding: '24px 30px', boxSizing: 'border-box', overflow: 'auto'
                    },
                    noCloseBtn : true,
                    description : '로그인이 만료되었거나, 비정상적인 접근입니다.<br>다시 로그인해주세요.',
                    btns : [{name: 'conf', text: '확인', class: 'blue'}],
                    eventHandler : (event: any) => {
                        console.log(event);
                        if (event.name === 'conf') {
                            this.confirmDlg.destroy();
                        }
                    }
                });
            }
        }
    }
</script>
<style lang="less">
    .dlg_test {
        padding: 20px;
        .dlg-btn {
            display: block;
            width: 230px;
            height: 80px;
            border: 1px solid;
            font-size:14px;
            margin: 20px 0;
        }
    }
</style>