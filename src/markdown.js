import markdownViewer from './components/markdown_viewer';

(function (window) {
    const toastcam = { markdownViewer };
    if ( typeof window === "object" ) {
        window.toastcam = toastcam;
    }
}(window));