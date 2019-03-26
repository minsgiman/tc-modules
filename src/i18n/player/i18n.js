import Vue from 'vue';
import VueI18n from 'vue-i18n';
import localeKR from './locale-ko';
import localeJP from './locale-ja';
import localeEN from './locale-en';

Vue.use(VueI18n);

const messages = {
    ko: localeKR,
    ja: localeJP,
    en: localeEN
};

let locale = 'ko';
if (navigator.language.indexOf('ko') != -1) {
    locale = 'ko';
} else if (navigator.language.indexOf('ja') != -1) {
    locale = 'ja';
} else if (navigator.language.indexOf('en') != -1) {
    locale = 'en';
}

export const i18n = new VueI18n({locale, messages});