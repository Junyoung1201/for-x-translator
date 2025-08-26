export type TranslatorType = 'deepl' | 'google' | 'papago';

export interface I_TranslateOptions {
    srcText: string,
    srcLang: string,
    destLang: string,
    translator: TranslatorType
}

export interface I_TranslatorOptions {
    srcLang: string
    destLang: string
}