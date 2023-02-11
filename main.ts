const State = {
    PRECALIBRATION: 0,
    CALIBRATION: 1,
    PLAYING: 2,
    GAME_OVER: 3,
    CONFIG_DIFFICULTY: 4
}

const DangerCase = {
    NONE: 0,
    X_AXIS: 1,
    Y_AXIS: 2,
    XY_AXIS: 3,
    DEAD: 4
}

let state = State.PRECALIBRATION

let difficulties = [2000, 1500, 1250, 1000, 750, 600, 450, 300, 100]
let difficultyLevel = 5
let accelerationThreshold = 750

let time = 0
let totalAccelerationX = 0
let totalAccelerationY = 0
let totalAccelerationZ = 0
let basex = 0
let basey = 0
let basez = 0

input.setAccelerometerRange(AcceleratorRange.TwoG)

function getTotalAcceleration(basex: number, basey: number, basez: number) {
    let ax = input.acceleration(Dimension.X)
    let ay = input.acceleration(Dimension.Y)
    let az = input.acceleration(Dimension.Z)
    return [Math.abs(ax) - basex, Math.abs(ay) - basey, Math.abs(az) - basez]
}

function getAcceleration() {
    let ax = input.acceleration(Dimension.X)
    let ay = input.acceleration(Dimension.Y)
    let az = input.acceleration(Dimension.Z)
    return [Math.abs(ax), Math.abs(ay), Math.abs(az)]
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

let lastDangerCase = 0

while (true) {
    if (state == State.CALIBRATION) {
        if (time < 3000) {
            let totalAcceleration = getAcceleration()
            totalAccelerationX += totalAcceleration[0]
            totalAccelerationY += totalAcceleration[1]
            totalAccelerationZ += totalAcceleration[2]
            time += 50
        } else {
            basex = totalAccelerationX / 60
            basey = totalAccelerationY / 60
            basez = totalAccelerationZ / 60
            basic.showLeds(`
                . . . . .
                . . . . .
                . . # . .
                . . . . .
                . . . . .
                `)
            state = State.PLAYING
            totalAccelerationX = 0
            totalAccelerationY = 0
            totalAccelerationZ = 0
            time = 0
        }
    } else if (state == State.PLAYING) {
        let totalAcceleration = getTotalAcceleration(basex, basey, basez)
        let dangerLevelX = totalAcceleration[0] / accelerationThreshold
        let dangerLevelY = totalAcceleration[1] / accelerationThreshold
        let dangerLevelZ = totalAcceleration[2] / accelerationThreshold

        let currentDangerCase = DangerCase.NONE

        if (dangerLevelX >= 1 || dangerLevelY >= 1 || dangerLevelZ >= 1) {
            currentDangerCase = DangerCase.DEAD
        } else if (dangerLevelY >= 0.5 && dangerLevelX >= 0.5) {
            currentDangerCase = DangerCase.XY_AXIS
        } else if (dangerLevelX >= 0.5) {
            currentDangerCase = DangerCase.X_AXIS
        } else if (dangerLevelY >= 0.5) {
            currentDangerCase = DangerCase.Y_AXIS
        } else {
            currentDangerCase = DangerCase.NONE
        }
        

        if (currentDangerCase != lastDangerCase) {
            if (currentDangerCase == DangerCase.DEAD) {
                basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `)
                state = State.GAME_OVER
            } else if (currentDangerCase == DangerCase.XY_AXIS) {
                basic.showLeds(`
                        . . . . .
                        . . # . .
                        . # # # .
                        . . # . .
                        . . . . .
                `)
            } else if (currentDangerCase == DangerCase.X_AXIS) {
                basic.showLeds(`
                        . . . . .
                        . . . . .
                        . # # # .
                        . . . . .
                        . . . . .
                `)
            } else if (currentDangerCase == DangerCase.Y_AXIS) {
                basic.showLeds(`
                        . . . . .
                        . . # . .
                        . . # . .
                        . . # . .
                        . . . . .
                `)
            } else {
                basic.showLeds(`
                . . . . .
                . . . . .
                . . # . .
                . . . . .
                . . . . .
                `)
            }
            lastDangerCase = currentDangerCase
        }
    }
    basic.pause(50)
}