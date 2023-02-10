const State = {
    PRECALIBRATION: 0,
    CALIBRATION: 1,
    PLAYING: 2,
    GAME_OVER: 3,
    CONFIG_DIFFICULTY: 4
}

let state = State.PRECALIBRATION

let difficulties = [2000, 1500, 1250, 1000, 750, 600, 450, 300, 100]
let difficultyLevel = 5
let accelerationThreshold = 750

let time = 0
let totalAcceleration = 0
let base = 0

input.setAccelerometerRange(AcceleratorRange.TwoG)

function getTotalAcceleration(base: number) {
    let ax = input.acceleration(Dimension.X)
    let ay = input.acceleration(Dimension.Y)
    let az = input.acceleration(Dimension.Z)
    return (Math.abs(ax) + Math.abs(ay) + Math.abs(az)) - base
}

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (state == State.CONFIG_DIFFICULTY) {
        state = State.PRECALIBRATION
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
        `)
    } else if (state == State.PRECALIBRATION) {
        state = State.CONFIG_DIFFICULTY
        basic.showNumber(difficultyLevel, 10)
    }
})

input.onButtonPressed(Button.A, function () {
    if (state == State.PRECALIBRATION) {
        basic.showLeds(`
            . . # . .
            . . # . .
            . . # . .
            . . # . .
            . . # . .
        `)

        basic.pause(1000)

        basic.showLeds(`
                # # # # #
                . # # # .
                . . # . .
                . # # # .
                # # # # #
                `)
        state = State.CALIBRATION
    } else if (state == State.PLAYING) {
        basic.showLeds(`
            # . . . #
            . # . # .
            . . # . .
            . # . # .
            # . . . #
        `)
        state = State.GAME_OVER
    } else if (state == State.CONFIG_DIFFICULTY) {
        if (difficultyLevel > 1) {
            difficultyLevel -= 1
            accelerationThreshold = difficulties[difficultyLevel - 1]
            basic.showNumber(difficultyLevel, 10)
        }
    }
})

input.onButtonPressed(Button.B, function () {
    if (state == State.GAME_OVER) {
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
        `)
        state = State.PRECALIBRATION
    } else if (state == State.CONFIG_DIFFICULTY) {
        if (difficultyLevel < 9) {
            difficultyLevel += 1
            accelerationThreshold = difficulties[difficultyLevel - 1]
            basic.showNumber(difficultyLevel, 10)
        }
    }
})

while (true) {
    if (state == State.CALIBRATION) {
        if (time < 3000) {
            totalAcceleration += getTotalAcceleration(0)
            time += 50
        } else {
            base = totalAcceleration / 60
            basic.showLeds(`
                . . . . .
                . . . . .
                . . # . .
                . . . . .
                . . . . .
                `)
            state = State.PLAYING
            totalAcceleration = 0
            time = 0
        }
    } else if (state == State.PLAYING) {
        if (getTotalAcceleration(base) > accelerationThreshold) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
            `)
            state = State.GAME_OVER
        }
    } else if (state == State.CONFIG_DIFFICULTY) {

    }
    basic.pause(50)
}