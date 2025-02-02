import {Dictionary} from './dictionary';
import {getUserLocale, getPageLocale, Locale} from './locale';
import {setLocaleCookie} from "./cookie";

/**
 * An object representing a Vavilon config
 *
 * A vavilon object is a set of parameters that configure the vavilon environment.
 * A vavilon object contains information about the locale used in browser, the
 * locale found in cookie, dictionaries and elements
 */
export class Vavilon {
    /**
     * The user-preferred locale
     *
     * The locale comes from user-set cookie or browser language
     */
    private readonly userLocale: Locale;

    /**
     * The original page locale
     *
     * The locale comes from the `lang` attribute of the `<html>` tag
     */
    private readonly pageLocale: Locale;

    /**
     * The collection of all vavilon-enabled elements on the page
     */
    private elements: HTMLCollectionOf<HTMLElement>;

    /**
     * The map of available dictionaries
     *
     * The keys are the {@link Locale} codes, whereas the values are the actual {@link Dictionary}s
     */
    private readonly dictionaries: { [key: string]: Dictionary };

    /**
     * The dictionary that is used to translate the page
     *
     * If the {@link userLocale} matches the {@link pageLocale}, the value of this is `null`.
     * However, if the user switches to a new language, and then back to {@link pageLocale}, the value will be {@link pageLocale}.
     */
    private pageDict: Locale;

    /**
     * Indicates whether the {@link pageDict} has been loaded
     */
    public pageDictLoaded: boolean;

    public constructor() {
        this.userLocale = getUserLocale();
        this.pageLocale = getPageLocale();

        this.elements = null;
        this.dictionaries = {};

        this.pageDict = null;
    }

    /**
     * Finds all vavilon-enabled elements on the page and stores them inside {@link elements}.
     */
    public find(): void {
        this.elements = document.getElementsByClassName('vavilon') as HTMLCollectionOf<HTMLElement>;
    }

    /**
     * Replaces all elements' texts with strings provided in the dictionary
     */
    public replace(): void {
        if (this.elements && this.pageDict) {
            if (!this.dictionaries[this.pageLocale]) {
                this.dictionaries[this.pageLocale] = new Dictionary(null);
            }

            Array.from(this.elements).forEach((el): void => {
                const strId = el.dataset.vavilon;
                if (this.dictionaries[this.pageDict].hasString(strId)) {
                    if (!this.dictionaries[this.pageLocale].hasString(strId)) {
                        this.dictionaries[this.pageLocale].strings[strId] = el.innerText.trim();
                    }
                    el.innerText = this.dictionaries[this.pageDict].strings[strId];
                }
            });
        }
    }

    /**
     * Finds the urls of dictionaries on the page and saves them to memory.
     *
     * Note that the dictionaries aren't being loaded, only the URLs are parsed
     */
    public addDicts(): void {
        Array.from(document.scripts)
            .filter((e): boolean => e.dataset.hasOwnProperty('vavilonDict'))
            .forEach((ds): void => {
                const dictLocale = ds.dataset.vavilonDict.toLowerCase();
                this.dictionaries[dictLocale] = new Dictionary(ds.src);
            });
    }

    /**
     * Loads the dictionaries based on previously saved URLs
     *
     * If no dictionaries are saved, this method doesn't do anything, even if the dictionary `<script>`s are present.
     * This is why it's important to call {@link addDicts} before this.
     *
     * @param primaryCb - an optional callback to execute after the {@link pageDict} has been loaded
     */
    public loadDicts(primaryCb?: Function): void {
        Object.keys(this.dictionaries)
            .forEach((loc): void => {
                if (loc === this.userLocale || loc.slice(0, 2) === this.userLocale.slice(0, 2) && !this.pageDict) {
                    this.pageDict = loc;
                    this.dictionaries[loc].load((): void => {
                        if (Object.keys(this.dictionaries[loc].strings).length === 0) {
                            delete this.dictionaries[loc]
                        } else {
                            this.pageDictLoaded = true;
                            primaryCb();
                        }
                    })
                } else {
                    this.dictionaries[loc].load((): void => {
                        if (Object.keys(this.dictionaries[loc].strings).length === 0) {
                            delete this.dictionaries[loc]
                        }
                    })
                }
            });
    }

    /**
     * Checks if the locale switch is possible and switches to it
     *
     * @param localeString - locale to switch to
     *
     * @returns `true` if the switch was possible and successful, `false` if it was not possible
     */
    public setLocale(localeString: Locale): boolean {
        if (this.dictionaries[localeString]) {
            this.pageDict = localeString;
            setLocaleCookie(this.pageDict);
            return true;
        } else if (this.dictionaries[localeString.slice(0, 2)]) {
            this.pageDict = localeString.slice(0, 2);
            setLocaleCookie(this.pageDict);
            return true;
        }

        return false;
    }

    /**
     * Return
     */
    public getTranslation(strId: string, arg: string): string {

        if (this.pageDict) {
            if (!this.dictionaries[this.pageDict]) {
                this.dictionaries[this.pageDict] = new Dictionary(null);
            }
            let translated = this.dictionaries[this.pageDict].strings[strId] || strId;
            if (translated.includes("%s")) {
                return translated.replace('%s', arg || '?')
            } else {
                return translated
            }
        } else {
            console.log("no pageDict for translation")
        }
        return strId;
    }
}
