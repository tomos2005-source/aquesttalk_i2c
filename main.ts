input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Heart)
    aquestalk.sayNumber("3.14")
    basic.showIcon(IconNames.Square)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.SmallHeart)
    aquestalk.say("ohayou")
    basic.showIcon(IconNames.Square)
})
basic.showIcon(IconNames.Heart)
aquestalk.sayNumberDigits("3.14")
aquestalk.sayNumber("123456")
aquestalk.sayAlpha("AT-3568P")
basic.showIcon(IconNames.Square)
aquestalk.sayWithSettings(
"ohayou",
300,
100,
100
)
