export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const WAIT_FOR_CONDITION_WARN_TIMEOUT = 60*1000;

export function waitForCondition(callback: () => boolean, timeout?: number) {

    let ms = 0;

    return new Promise((res,rej) => {
        let timer = setInterval(() => {

            ms++;

            if(ms == WAIT_FOR_CONDITION_WARN_TIMEOUT) {
                console.warn(`waitForCondition이 계속 작동 중입니다! 원치않는 waitForCondition의 활동일 경우 timeout 값을 추가해야할 수 있습니다.`)
            }

            if (timeout && ms >= timeout) {
                clearInterval(timer);
                return rej(`타임아웃 (${timeout}ms)`);
            }

            if (callback()) {
                clearInterval(timer);
                return res(null);
            }
        }, 1);
    })
}