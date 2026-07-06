/**
 * AquesTalk (ATP3012) 用のカスタムブロック
 */
//% color="#2ecc71" icon="\uf028" block="AquesTalk"
namespace aquestalk {
    /**
         * 桁読みとテキストを結合して喋らせます。
         * @param text1 前半のテキスト
         * @param num 桁読みする数値
         * @param text2 後半のテキスト
         */
    //% block="桁読みで喋る %text1 桁読み %num %text2"
    export function sayDigitsCombined(text1: string, num: string, text2: string): void {
        // すべて繋げて一つのタグ＋文字列にする
        let fullText = text1 + "<NUMK VAL=" + num + ">" + text2;
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

    // 内部処理を共通化してコードをスッキリさせます
    function sendText(text: string): void {
        let buf = pins.createBuffer(text.length + 1);
        for (let i = 0; i < text.length; i++) {
            buf.setNumber(NumberFormat.Int8LE, i, text.charCodeAt(i));
        }
        buf.setNumber(NumberFormat.Int8LE, text.length, 13);
        pins.i2cWriteBuffer(46, buf);
    }
    /**
     * 指定したローマ字を喋らせます。
     * @param text 発音するローマ字（例: "ohayou"）, eg: "ohayou"
     */
    //% block="喋る %text"
    export function say(text: string): void {
        // AquesTalkは最後に \r (13) が必要
        let buf = pins.createBuffer(text.length + 1);
        for (let i = 0; i < text.length; i++) {
            buf.setNumber(NumberFormat.Int8LE, i, text.charCodeAt(i));
        }
        buf.setNumber(NumberFormat.Int8LE, text.length, 13); // CRコード

        // I2Cアドレス 0x2E (46) に書き込み
        pins.i2cWriteBuffer(46, buf);
    }

    /**
     * 音声記号（例: "kon'nichiwa"）を送信して再生します。
     */
    //% block="音声を停止"
    export function stop(): void {
        pins.i2cWriteBuffer(46, Buffer.fromUTF8(">"));
    }
}