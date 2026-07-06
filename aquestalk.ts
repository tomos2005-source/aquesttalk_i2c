/**
 * AquesTalk (ATP3012) 用のカスタムブロック
 */
//% color="#2ecc71" icon="\uf028" block="AquesTalk"
namespace aquestalk {

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