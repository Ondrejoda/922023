const State = {
    CALIBRATION: 0,
    PLAYING: 1,
    GAME_OVER: 2,
    CONFIG_DIFFICULTY: 3
}

const LAST_STATE = 3

let state = State.CALIBRATION

let accelerationThreshold = 750
let gyroThreshold = 1

input.setAccelerometerRange(AcceleratorRange.TwoG)

function advanceState() {
    state += 1
    if (state > LAST_STATE) {
        state = 0
    }
}

function getTotalAcceleration(base:number) {
    let ax = input.acceleration(Dimension.X)
    let ay = input.acceleration(Dimension.Y)
    let az = input.acceleration(Dimension.Z)
    return (Math.abs(ax) + Math.abs(ay) + Math.abs(az)) - base
}

function getTotalGyro() {
    let gyro = 0
    gyro += input.rotation(Rotation.Pitch)
    gyro += input.rotation(Rotation.Roll)
    return gyro
}

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    advanceState()
})

let time = 0
let totalAcceleration = 0
let base = 0





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
        if (input.buttonIsPressed(Button.A)) {
            control.reset()
        }
    }
    basic.pause(50)
}