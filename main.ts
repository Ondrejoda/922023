const State = {
    PRECALIBRATION: 0,
    CALIBRATION: 1,
    PLAYING: 2,
    GAME_OVER: 3,
    CONFIG_DIFFICULTY: 4
}

let state = State.PRECALIBRATION

let accelerationThreshold = 750

input.setAccelerometerRange(AcceleratorRange.TwoG)

function getTotalAcceleration(base:number) {
    let ax = input.acceleration(Dimension.X)
    let ay = input.acceleration(Dimension.Y)
    let az = input.acceleration(Dimension.Z)
    return (Math.abs(ax) + Math.abs(ay) + Math.abs(az)) - base
}

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    if (state == State.CONFIG_DIFFICULTY) {
        state == State.PRECALIBRATION
    } else {
        state == State.CONFIG_DIFFICULTY
    }
})

let time = 0
let totalAcceleration = 0
let base = 0

while (true) {
    if (state == State.PRECALIBRATION) {
        while (true) {
            if (input.buttonIsPressed(Button.A)) {
                basic.showLeds(`
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                `)
                break
            }
        }

        basic.pause(1000)

        basic.showLeds(`
                # # # # #
                . # # # .
                . . # . .
                . # # # .
                # # # # #
                `)
        state = State.CALIBRATION
    }
    else if (state == State.CALIBRATION) {
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
    } else if (state == State.GAME_OVER) {
        if (input.buttonIsPressed(Button.B)) {
            control.reset()
        }
    } else if (state == State.CONFIG_DIFFICULTY) {
        basic.showLeds(`
            # . . . #
            . # # # .
            . # . # .
            . # # # .
            # . . . #
        `)        
    }
    basic.pause(50)
}