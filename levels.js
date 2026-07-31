const TOTAL_LEVELS = 7;

const LEVELS = [
    {
        levelNumber: 1,
        name: "1.5KW E-Bike",
        bikeImage: "1.5KWEbike.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 1000,
                y: 520,
                scale: 0.34
            },
            {
                x: 1210,
                y: 455,
                scale: 0.32
            }
        ],

        blocks: [
            {
                x: 930,
                y: 540,
                width: 35,
                height: 180,
                type: "wood"
            },
            {
                x: 1070,
                y: 540,
                width: 35,
                height: 180,
                type: "wood"
            },
            {
                x: 1000,
                y: 430,
                width: 190,
                height: 30,
                type: "wood"
            },

            {
                x: 1140,
                y: 540,
                width: 35,
                height: 180,
                type: "wood"
            },
            {
                x: 1280,
                y: 540,
                width: 35,
                height: 180,
                type: "wood"
            },
            {
                x: 1210,
                y: 430,
                width: 190,
                height: 30,
                type: "wood"
            }
        ]
    },

    {
        levelNumber: 2,
        name: "5KW E-Bike",
        bikeImage: "5kwEbike.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 960,
                y: 510,
                scale: 0.31
            },
            {
                x: 1170,
                y: 430,
                scale: 0.31
            },
            {
                x: 1380,
                y: 510,
                scale: 0.31
            }
        ],

        blocks: [
            {
                x: 880,
                y: 540,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 1040,
                y: 540,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 960,
                y: 420,
                width: 210,
                height: 30,
                type: "wood"
            },

            {
                x: 1090,
                y: 470,
                width: 35,
                height: 300,
                type: "stone"
            },
            {
                x: 1250,
                y: 470,
                width: 35,
                height: 300,
                type: "stone"
            },
            {
                x: 1170,
                y: 300,
                width: 210,
                height: 30,
                type: "stone"
            },

            {
                x: 1300,
                y: 540,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 1460,
                y: 540,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 1380,
                y: 420,
                width: 210,
                height: 30,
                type: "wood"
            }
        ]
    },

    {
        levelNumber: 3,
        name: "EBOX 3.0",
        bikeImage: "ebox3.0.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 960,
                y: 500,
                scale: 0.34
            },
            {
                x: 1150,
                y: 385,
                scale: 0.32
            },
            {
                x: 1340,
                y: 500,
                scale: 0.34
            }
        ],

        blocks: [
            {
                x: 900,
                y: 545,
                width: 40,
                height: 210,
                type: "wood"
            },
            {
                x: 1020,
                y: 545,
                width: 40,
                height: 210,
                type: "wood"
            },
            {
                x: 960,
                y: 420,
                width: 170,
                height: 35,
                type: "stone"
            },

            {
                x: 1060,
                y: 480,
                width: 40,
                height: 320,
                type: "stone"
            },
            {
                x: 1240,
                y: 480,
                width: 40,
                height: 320,
                type: "stone"
            },
            {
                x: 1150,
                y: 290,
                width: 230,
                height: 35,
                type: "stone"
            },

            {
                x: 1280,
                y: 545,
                width: 40,
                height: 210,
                type: "wood"
            },
            {
                x: 1400,
                y: 545,
                width: 40,
                height: 210,
                type: "wood"
            },
            {
                x: 1340,
                y: 420,
                width: 170,
                height: 35,
                type: "stone"
            }
        ]
    },

    {
        levelNumber: 4,
        name: "Tuttio",
        bikeImage: "tuttio.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 900,
                y: 510,
                scale: 0.32
            },
            {
                x: 1100,
                y: 410,
                scale: 0.32
            },
            {
                x: 1300,
                y: 310,
                scale: 0.32
            },
            {
                x: 1500,
                y: 510,
                scale: 0.32
            }
        ],

        blocks: [
            {
                x: 830,
                y: 545,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 970,
                y: 545,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 900,
                y: 425,
                width: 190,
                height: 30,
                type: "wood"
            },

            {
                x: 1020,
                y: 485,
                width: 35,
                height: 320,
                type: "stone"
            },
            {
                x: 1180,
                y: 485,
                width: 35,
                height: 320,
                type: "stone"
            },
            {
                x: 1100,
                y: 300,
                width: 210,
                height: 30,
                type: "stone"
            },

            {
                x: 1220,
                y: 425,
                width: 35,
                height: 440,
                type: "stone"
            },
            {
                x: 1380,
                y: 425,
                width: 35,
                height: 440,
                type: "stone"
            },
            {
                x: 1300,
                y: 180,
                width: 210,
                height: 30,
                type: "stone"
            },

            {
                x: 1430,
                y: 545,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 1570,
                y: 545,
                width: 35,
                height: 200,
                type: "wood"
            },
            {
                x: 1500,
                y: 425,
                width: 190,
                height: 30,
                type: "wood"
            }
        ]
    },

    {
        levelNumber: 5,
        name: "Surron LBX",
        bikeImage: "surronLBX1.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 950,
                y: 500,
                scale: 0.3
            },
            {
                x: 1150,
                y: 380,
                scale: 0.3
            },
            {
                x: 1350,
                y: 500,
                scale: 0.3
            },
            {
                x: 1550,
                y: 380,
                scale: 0.3
            }
        ],

        blocks: [
            {
                x: 875,
                y: 540,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 1025,
                y: 540,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 950,
                y: 410,
                width: 200,
                height: 35,
                type: "stone"
            },

            {
                x: 1065,
                y: 475,
                width: 40,
                height: 350,
                type: "wood"
            },
            {
                x: 1235,
                y: 475,
                width: 40,
                height: 350,
                type: "wood"
            },
            {
                x: 1150,
                y: 270,
                width: 220,
                height: 35,
                type: "stone"
            },

            {
                x: 1275,
                y: 540,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 1425,
                y: 540,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 1350,
                y: 410,
                width: 200,
                height: 35,
                type: "stone"
            },

            {
                x: 1465,
                y: 475,
                width: 40,
                height: 350,
                type: "wood"
            },
            {
                x: 1635,
                y: 475,
                width: 40,
                height: 350,
                type: "wood"
            },
            {
                x: 1550,
                y: 270,
                width: 220,
                height: 35,
                type: "stone"
            }
        ]
    },

    {
        levelNumber: 6,
        name: "Surron Ultra Bee",
        bikeImage: "surronUBX.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 900,
                y: 500,
                scale: 0.29
            },
            {
                x: 1080,
                y: 390,
                scale: 0.29
            },
            {
                x: 1260,
                y: 280,
                scale: 0.29
            },
            {
                x: 1440,
                y: 390,
                scale: 0.29
            },
            {
                x: 1620,
                y: 500,
                scale: 0.29
            }
        ],

        blocks: [
            {
                x: 835,
                y: 545,
                width: 40,
                height: 210,
                type: "stone"
            },
            {
                x: 965,
                y: 545,
                width: 40,
                height: 210,
                type: "stone"
            },
            {
                x: 900,
                y: 420,
                width: 180,
                height: 35,
                type: "stone"
            },

            {
                x: 1010,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1150,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1080,
                y: 295,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1180,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1340,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1260,
                y: 170,
                width: 210,
                height: 35,
                type: "stone"
            },

            {
                x: 1370,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1510,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1440,
                y: 295,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1555,
                y: 545,
                width: 40,
                height: 210,
                type: "stone"
            },
            {
                x: 1685,
                y: 545,
                width: 40,
                height: 210,
                type: "stone"
            },
            {
                x: 1620,
                y: 420,
                width: 180,
                height: 35,
                type: "stone"
            }
        ]
    },

    {
        levelNumber: 7,
        name: "Stark Varg",
        bikeImage: "StarkVarg.png",

        birdStart: {
            x: 260,
            y: 485
        },

        slingshot: {
            x: 260,
            y: 485
        },

        bikes: [
            {
                x: 880,
                y: 500,
                scale: 0.16
            },
            {
                x: 1050,
                y: 390,
                scale: 0.16
            },
            {
                x: 1220,
                y: 280,
                scale: 0.16
            },
            {
                x: 1390,
                y: 280,
                scale: 0.16
            },
            {
                x: 1560,
                y: 390,
                scale: 0.16
            },
            {
                x: 1730,
                y: 500,
                scale: 0.16
            }
        ],

        blocks: [
            {
                x: 820,
                y: 545,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 940,
                y: 545,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 880,
                y: 415,
                width: 170,
                height: 35,
                type: "stone"
            },

            {
                x: 980,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1120,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1050,
                y: 295,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1150,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1290,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1220,
                y: 170,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1320,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1460,
                y: 430,
                width: 40,
                height: 450,
                type: "stone"
            },
            {
                x: 1390,
                y: 170,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1490,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1630,
                y: 490,
                width: 40,
                height: 330,
                type: "wood"
            },
            {
                x: 1560,
                y: 295,
                width: 190,
                height: 35,
                type: "stone"
            },

            {
                x: 1670,
                y: 545,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 1790,
                y: 545,
                width: 40,
                height: 220,
                type: "stone"
            },
            {
                x: 1730,
                y: 415,
                width: 170,
                height: 35,
                type: "stone"
            }
        ]
    }
];

function getLevelData(levelNumber) {
    const level = LEVELS.find(
        (item) => item.levelNumber === levelNumber
    );

    if (!level) {
        console.error(`Level ${levelNumber} does not exist.`);
        return LEVELS[0];
    }

    return level;
}

function getBikeImagePath(levelNumber) {
    const level = getLevelData(levelNumber);

    return `Bikes/${level.bikeImage}`;
}

function getLevelName(levelNumber) {
    const level = getLevelData(levelNumber);

    return level.name;
}

function getTotalBikes(levelNumber) {
    const level = getLevelData(levelNumber);

    return level.bikes.length;
}

window.LEVELS = LEVELS;
window.TOTAL_LEVELS = TOTAL_LEVELS;
window.getLevelData = getLevelData;
window.getBikeImagePath = getBikeImagePath;
window.getLevelName = getLevelName;
window.getTotalBikes = getTotalBikes;