import {Locale} from "./locale";
import {Vavilon} from "./vavilon";

declare global {
    interface Window {
        // IE navigator language settings (non-standard)
        userLanguage: string;
        browserLanguage: string;

        /**
         * Changes the page language
         *
         * The execution of this method will change the {@link Vavilon.pageLocale}
         * of the vavilon instance, save the selected locale to cookie and replace
         * the text of all the vavilon-enabled elements on the page.
         *
         * @param localeString - the locale to switch to
         */
        setLang(localeString: Locale): void;
        ___i18n(stringKey: string): string;
    }
}


/**
 * Core vavilon object instance
 *
 * This object stores the data about the page, where vavilon is executed
 */
const vavilon: Vavilon = new Vavilon();

/**
 * Indicates whether the whole page has been loaded
 */
let pageLoaded = false;

vavilon.addDicts();
vavilon.loadDicts((): void => {
    if (pageLoaded) {
        vavilon.replace();
    }
});

window.onload = function (): void {
    vavilon.find();
    pageLoaded = true;

    if (vavilon.pageDictLoaded) {
        vavilon.replace();
    }else{
        console.log('dictionary not loaded yet')
    }
};

/**
 * Changes the page language
 *
 * The execution of this method will change the {@link Vavilon.pageLocale}
 * of the vavilon instance, save the selected locale to cookie and replace
 * the text of all the vavilon-enabled elements on the page.
 *
 * @param localeString - the locale to switch to
 */
window.setLang = function (localeString: Locale): void {
    localeString = localeString.toLowerCase();

    const changeSuccessful: boolean = vavilon.setLocale(localeString);

    if (changeSuccessful) {
        vavilon.replace();
    }
};

/**
 * Get the translation for a single string
 *
 * Lookup a single item in the currently loaded locale dictionary
 *
 * @param stringKey - the dictionary key
 */
window.___i18n = function (stringKey: string): string {
    return vavilon.getTranslation(stringKey)
};
