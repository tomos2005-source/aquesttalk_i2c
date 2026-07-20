/**
 * AquesTalk (ATP3012) 用のカスタムブロック（ソフトウェアBusy判定版）
 */
//% color="#2ecc71" icon="\uf028" block="AquesTalk"
namespace aquestalk {

    const I2C_ADDR = 46; // ATP3012のデフォルトI2Cアドレス (0x2E)

    /**
     * 桁読みとテキストを結合して喋らせます。
     * @param text1 前半のテキスト
     * @param num 桁読みする数値
     * @param text2 後半のテキスト
     */
    //% block="桁読みで喋る %text1 桁読み %num %text2"
    export function sayDigitsCombined(text1: string, num: string, text2: string): void {
        let fullText = text1 + "<NUMK VAL=" + num + ">" + text2;
        sendText(fullText);
    }

    /**
     * 助数詞を付けた桁読みとテキストを結合して喋らせます。
     * @param text1 前半のテキスト
     * @param num 桁読みする数値
     * @param counter 助数詞
     * @param text2 後半のテキスト
     */
    //% block="助数詞付きで喋る %text1 桁読み %num 助数詞 %counter %text2"
    export function sayDigitsCounterCombined(text1: string, num: string, counter: string, text2: string): void {
        let fullText = text1 + "<NUMK VAL=" + num + " COUNTER=" + counter + ">" + text2;
        sendText(fullText);
    }

    /**
     * 棒読み（通常読み）とテキストを結合して喋らせます。
     * @param text1 前半のテキスト
     * @param num 読み上げる数値
     * @param text2 後半のテキスト
     */
    //% block="棒読みで喋る %text1 棒読み %num %text2"
    export function sayNumberCombined(text1: string, num: string, text2: string): void {
        let fullText = text1 + "<NUM VAL=" + num + ">" + text2;
        sendText(fullText);
    }

    /**
     * 数値を「読み上げ（通常読み）」で発音します。
     * @param num 読み上げる数値, eg: "3.14"
     */
    //% block="数値を読む %num"
    export function sayNumber(num: string): void {
        sendText("<NUM VAL=" + num + ">");
    }

    /**
     * 数値を「桁読み」で発音します。
     * @param num 読み上げる数値, eg: "321162567"
     */
    //% block="数値を桁読みする %num"
    export function sayNumberDigits(num: string): void {
        sendText("<NUMK VAL=" + num + ">");
    }

    /**
     * 英数字や記号を適切な読みとアクセントで読み上げます。
     * @param text 読み上げる英数字, eg: "AT-3568P"
     */
    //% block="英数字を読む %text"
    export function sayAlpha(text: string): void {
        sendText("<ALPHA VAL=" + text + ">");
    }

    /**
     * 無声化（アンダーバー付き）の読みを指定して喋ります。
     * @param text 無声化記号を含むテキスト, eg: "e'rume_suno"
     */
    //% block="無声化で喋る %text"
    export function sayVoiceless(text: string): void {
        sendText(text);
    }

    /**
     * 声の「速さ」「高さ」「音量」を数値で指定してローマ字を喋らせます。
     * @param text 発音するローマ字
     * @param speed 速さ(50-300)
     * @param pitch 高さ(50-200)
     * @param volume 音量(0-100)
     */
    //% block="声を設定して喋る %text 速さ %speed 高さ %pitch 音量 %volume"
    export function sayWithSettings(text: string, speed: string, pitch: string, volume: string): void {
        let tags = "<SPD VAL=" + speed + "><PITCH VAL=" + pitch + "><VOL VAL=" + volume + ">";
        sendText(tags + text);
    }

    /**
     * 指定したローマ字を喋らせます。
     * @param text 発音するローマ字（例: "ohayou"）, eg: "ohayou"
     */
    //% block="喋る %text"
    export function say(text: string): void {
        sendText(text);
    }

    /**
     * いまAquesTalkが喋っている最中なら真(true)を返します（ソフトウェア判定）。
     */
    //% block="話し中"
    export function isBusy(): boolean {
        // I2Cから1バイト読み込む
        let buf = pins.i2cReadBuffer(I2C_ADDR, 1);
        if (buf.length > 0) {
            let status = buf.getNumber(NumberFormat.UInt8LE, 0);
            // '>' (0x3E) が返ってきたらプロンプト（Ready）状態なので、それ以外ならBusy
            return status !== 0x3E;
        }
        // 読み込みに失敗した場合は安全のためfalseを返す
        return false;
    }

    /**
     * 現在の発声が終了するまでプログラムを一時停止（ウェイト）させます。
     */
    //% block="話し終わるまで待つ"
    export function waitUntilDone(): void {
        while (isBusy()) {
            basic.pause(50);
        }
    }

    /**
     * 音声記号（例: "kon'nichiwa"）を送信して再生します。
     */
    //% block="音声を停止"
    export function stop(): void {
        pins.i2cWriteBuffer(I2C_ADDR, Buffer.fromUTF8(">"));
    }

    // 内部処理の共通化
    function sendText(text: string): void {
        // コマンド送信直後は少し待ってから送信（念のため）
        let buf = pins.createBuffer(text.length + 1);
        for (let i = 0; i < text.length; i++) {
            buf.setNumber(NumberFormat.Int8LE, i, text.charCodeAt(i));
        }
        buf.setNumber(NumberFormat.Int8LE, text.length, 13); // キャリッジリターン(\r)
        pins.i2cWriteBuffer(I2C_ADDR, buf);

        // テキスト送信直後はLSIが処理を開始するまで一瞬ラグがあるため、
        // 直後のisBusy()がReadyを誤検知しないよう少しウェイトを入れると安定します
        basic.pause(20);
    }
}