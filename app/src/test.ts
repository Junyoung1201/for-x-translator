import { initDebugMode } from "./debug";
import { closeBrowser, translate_DeepL, translate_Google } from "./translate";

(async () => {

    console.clear();

    await initDebugMode();

    try {
        const exampleSrcText = "私たちは暗い空の下でも、高い空への飛躍を夢見ている。";

        const [deepl,google] = await Promise.all([
            translate_DeepL(exampleSrcText),
            translate_Google(exampleSrcText)
        ])

        console.log("\n테스트 성공:")
        console.log(`  DeepL: "${deepl}"`);
        console.log(`  Google: "${google}"`);
        console.log("");

    } catch (err) {
        console.error("테스트 실패");
        console.error(err);
    } finally {

        await closeBrowser();
        console.log("테스트 종료")
        
    }
})();