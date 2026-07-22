/**
 * AquesTalk (音声合成) カスタムブロック
 */
//% color="#2ecc71" icon="\uf028" block="AquesTalk"
namespace aquestalk {

    const I2C_ADDR = 46; // ATP3012のデフォルトI2Cアドレス (0x2E)

    // ==========================================
    // 基本のしゃべるブロック
    // ==========================================

    /**
     * ローマ字でテキストをしゃべらせます。
     * @param text 音声記号（例: "ohayou"）, eg: "ohayou"
     */
    //% block="しゃべる %text"
    export function say(text: string): void {
        sendText(text);
    }

    /**
     * 数値を1つずつ「いち・に・さん」と順番に読み上げます。
     * @param num 読む数字, eg: "3.14"
     */
    //% block="数字を1つずつ読む %num"
    export function sayNumber(num: string): void {
        sendText("<NUM VAL=" + num + ">");
    }

    /**
     * 数値を「せんにひゃくさんじゅうよん」と位（桁）をつけて読み上げます。
     * @param num 読む数字, eg: "1234"
     */
    //% block="数字を桁付きで読む %num"
    export function sayNumberDigits(num: string): void {
        sendText("<NUMK VAL=" + num + ">");
    }

    /**
     * アルファベットや記号を読み上げます。
     * @param text 読む英数字（例: "AT-3568P"）, eg: "AT-3568P"
     */
    //% block="アルファベットを読む %text"
    export function sayAlpha(text: string): void {
        sendText("<ALPHA VAL=" + text + ">");
    }

    // ==========================================
    // つなげて喋るブロック（1文にまとめてスムーズに発声）
    // ==========================================

    /**
     * 前後の言葉と数字（1つずつ読み）をつなげて1文でしゃべらせます。
     * @param text1 前の言葉, eg: "korewa"
     * @param num 数字, eg: "123"
     * @param text2 後の言葉, eg: "desu"
     */
    //% block="つなげて喋る(1つずつ) 前%text1 数字%num 後%text2"
    export function sayNumberCombined(text1: string, num: string, text2: string): void {
        let fullText = text1 + "<NUM VAL=" + num + ">" + text2;
        sendText(fullText);
    }

    /**
     * 前後の言葉と数字（桁付き読み）をつなげて1文でしゃべらせます。
     * @param text1 前の言葉, eg: "gonokoudaiga"
     * @param num 数字, eg: "321"
     * @param text2 後の言葉, eg: "yen"
     */
    //% block="つなげて喋る(桁付き) 前%text1 数字%num 後%text2"
    export function sayDigitsCombined(text1: string, num: string, text2: string): void {
        let fullText = text1 + "<NUMK VAL=" + num + ">" + text2;
        sendText(fullText);
    }

    /**
     * 単位をつけて数字と前後の言葉をつなげて1文でしゃべらせます。
     * @param text1 前の言葉, eg: "ringoga"
     * @param num 数字, eg: "3"
     * @param counter 単位（例: "ko"）, eg: "ko"
     * @param text2 後の言葉, eg: "arimasu"
     */
    //% block="単位付きでつなげて喋る 前%text1 数字%num 単位%counter 後%text2"
    export function sayDigitsCounterCombined(text1: string, num: string, counter: string, text2: string): void {
        let fullText = text1 + "<NUMK VAL=" + num + " COUNTER=" + counter + ">" + text2;
        sendText(fullText);
    }

    // ==========================================
    // 記号変換ブロック（「しゃべる」や標準のテキスト結合にはめ込んで使う）
    // ==========================================

    /**
     * 数字（1つずつ読み）を音声記号テキストに変換します。
     * @param num 読む数字, eg: "123"
     */
    //% block="数字(1つずつ) %num"
    export function numSymbol(num: string): string {
        return "<NUM VAL=" + num + ">";
    }

    /**
     * 数字（桁付き読み）を音声記号テキストに変換します。
     * @param num 読む数字, eg: "123"
     */
    //% block="数字(桁付き) %num"
    export function numkSymbol(num: string): string {
        return "<NUMK VAL=" + num + ">";
    }

    // ==========================================
    // 設定・制御ブロック
    // ==========================================

    /**
     * 話すスピード、声の高さ、音量を変更してしゃべらせます。
     * @param text 音声記号, eg: "ohayou"
     * @param speed 話す速さ (50~300), eg: 100
     * @param pitch 声の高さ (50~200), eg: 100
     * @param volume 声の大きさ (0~100), eg: 100
     */
    //% block="声を変えてしゃべる %text|速さ %speed|高さ %pitch|音量 %volume"
    //% speed.min=50 speed.max=300 speed.defl=100
    //% pitch.min=50 pitch.max=200 pitch.defl=100
    //% volume.min=0 volume.max=100 volume.defl=100
    export function sayWithSettings(text: string, speed: number, pitch: number, volume: number): void {
        let tags = "<SPD VAL=" + speed + "><PITCH VAL=" + pitch + "><VOL VAL=" + volume + ">";
        sendText(tags + text);
    }

    /**
     * いま喋っている最中なら「真(true)」を返します。
     */
    //% block="おしゃべり中"
    export function isBusy(): boolean {
        let buf = pins.i2cReadBuffer(I2C_ADDR, 1);
        if (buf.length > 0) {
            let status = buf.getNumber(NumberFormat.UInt8LE, 0);
            return status !== 0x3E; // '>' (0x3E) 以外ならBusy
        }
        return false;
    }

    /**
     * 話し終わるまで次のプログラムに進まず待ちます。
     */
    //% block="話し終わるまで待つ"
    export function waitUntilDone(): void {
        while (isBusy()) {
            basic.pause(50);
        }
    }

    /**
     * おしゃべりを途中で止めます。
     */
    //% block="声を止める"
    export function stop(): void {
        pins.i2cWriteBuffer(I2C_ADDR, Buffer.fromUTF8(">"));
    }

    // 内部処理
    function sendText(text: string): void {
        let buf = pins.createBuffer(text.length + 1);
        for (let i = 0; i < text.length; i++) {
            buf.setNumber(NumberFormat.Int8LE, i, text.charCodeAt(i));
        }
        buf.setNumber(NumberFormat.Int8LE, text.length, 13); // CR (\r)
        pins.i2cWriteBuffer(I2C_ADDR, buf);
        basic.pause(20); // 送信直後の判定ブレ防止
    }
}