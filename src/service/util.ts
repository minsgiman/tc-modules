export function getBrowserLanguage(): string | null {
    const nav: any = window.navigator,
        browserLanguagePropertyKeys: string[] = [ 'language', 'browserLanguage', 'systemLanguage', 'userLanguage' ];
    let i: number, language: string;

    if (nav.languages && nav.languages.length) {
        const htmlTag: HTMLElement | null = document.querySelector('html'),
            htmlLang: string | null = htmlTag ? htmlTag.getAttribute('lang') : null;

        for (i = 0; i < nav.languages.length; i++) {
            language = nav.languages[i];
            if (htmlLang === nav.languages[i]) {
                return language;
            }
        }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
        language = nav[browserLanguagePropertyKeys[i]];
        if (language && language.length) {
            return language;
        }
    }

    return null;
}