import fs from 'fs/promises';
import path from 'path';

interface I_Config {
    lastGameDir?: string
    lastTranslationFile?: string
}

export class Config {
    private static DEF_CONFIG: I_Config = {}

    private static config: I_Config = {}

    static getConfigFilePath() {
        return path.join(__APP_PATH, "config.json");
    }

    static getConfig() {
        return { ...Config.config };
    }

    static setLastTranslationFile(file: string) {
        Config.config.lastTranslationFile = file;
    }

    static setLastGameDir(dir: string) {
        Config.config.lastGameDir = dir;
    }

    static async hasConfigFile() {
        try {
            await fs.access(Config.getConfigFilePath());
            return true;
        } catch (err) {
            return false;
        }
    }

    static async createDefaultConfigFile() {
        try {
            console.log("기본 설정 파일을 작성 중입니다.")

            Config.config = Config.DEF_CONFIG;
            await Config.saveConfig();

        } catch (err) {
            console.error(`기본 설정 파일 작성에 실패했습니다.`);
            console.error(err);
        }
    }

    static async loadConfig() {
        if (!await Config.hasConfigFile()) {
            await Config.createDefaultConfigFile();
        } else {
            console.log("설정을 불러오는 중입니다.")

            try {

                const configStr = await fs.readFile(Config.getConfigFilePath(), "utf-8");
                Config.config = JSON.parse(configStr) as I_Config;

            } catch (err) {
                console.error(`설정을 불러오지 못했습니다. 기본 설정을 사용합니다.`)
                console.error(err);
                Config.config = {...Config.DEF_CONFIG};
            }
        }
    }

    static async saveConfig() {

        try {
            const configStr = JSON.stringify(Config.config, null, 4);

            await fs.writeFile(Config.getConfigFilePath(), configStr, "utf-8");

            console.log("설정을 저장했습니다.")
        } catch (err) {
            console.error("설정을 저장하지 못했습니다.")
            console.error(err);
        }
    }
}