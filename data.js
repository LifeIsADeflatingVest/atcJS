//Initialize all variables
let area, backgroundImage, runways, fixes, navpoints, exitpoints, flights, limits, diversions;
// Emergencies can be common among maps
let takeOffEmergencies = ["engine failure", "bird strike", "flap malfunction", "engine problems", "engine fire", "engine vibration", "instrument failure", "control problem"];
let laterEmergencies = ["fuel leak", "hydraulic problem", "pressurization issue", "electrical failure", "medical emergency", "smoke in the cockpit", "smoke in the cabin", "cargo fire", "engine vibration"];

// maps as array of objects
/*
 * TO MAKE YOUR OWN MAP AND ASSOCIATED DATA,
 * SIMPLY ADD OBJECTS TO THIS ARRAY.
 *
 * Coordinates are MAP PERCENTAGES, so that e.g. `xStart: 56`
 * refers to x being at 56% cnvas width. Certain numbers reflect
 * difference from some other point, e.g. `textXR: -4.5`, meaning
 * 4.5% to the left. Consult the relevant variables in `script.js`
 * to understand the logic — or simply experiment with numbers
 * and see how they appear on your map.
 */

let theMaps = [
    {   area: "LGAV",
        backgroundImage: 'img/LGAV.webp',
        runways: [
            {xStart: 56, yStart: 49.5, xEnd: 57, yEnd: 47.5, rwy: "03L", textX: 24.5, textY:10, textXR: -4.5, textYR: -30, rRwy: "21R", rwyDirection: 30},
            {xStart: 56.5, yStart: 50, xEnd: 57.5, yEnd: 48, rwy: "03R", textX: 9.5, textY:20, textXR: -20.5, textYR: -20, rRwy: "21L", rwyDirection: 30},
        ],
         fixes: [
            {rwyDir: 30, fafX: 53.5, fafY: 55.5, iafX: 49, iafY:63.5},
            {rwyDir: 210, fafX: 59.5, fafY: 43, iafX: 63, iafY: 35}
        ],
        navpoints: [
            [52, 44, "ABLON"],
            [71, 48, "NEVRA"],
            [65, 77, "KEA"],
            [70, 6, "KERES"],
            [45, 65, "KUGGI"],
            [31, 58, "KOR"],
            [41, 94, "VELOP"],
            [37, 45, "GERMI"],
            [25, 50, "PIKAD"],
            [21, 68, "NEMES"],
            [50, 9, "SIGFO"],
            [82, 87, "VARIX"],
            [18, 27, "XANIS"],
            [82, 29, "SOSIR"]
        ],
        exitpoints: ["XANIS", "NEMES", "VELOP", "VARIX", "SOSIR", "SIGFO"],
        flights:  [
            {airline: "AEE", aircraft: ["A320", "A321"], max: -1, dir: [0,1,2,3]}, // dir = possible arrival directions, respectively N, E, S, W
            {airline: "OAL", aircraft: ["AT4", "AT7"], max: -1, dir: [0,1,2,3,]},
            {airline: "SEH", aircraft: ["AT7", "A320", "A321"], max: -1, dir: [0,1,2,3]},
            {airline: "CYP", aircraft: ["A320"], max: 2, dir:[1]},
            {airline: "WZZ", aircraft: ["A320", "A321"], max: 2, dir: [0,3]},
            {airline: "RYR", aircraft: ["B738", "MAX"], max: 3, dir:[0,1,2,3]},
            {airline: "NSZ", aircraft: ["B738", "MAX"], max: 2, dir:[0,3]},
            {airline: "FIN", aircraft: ["A320", "A321"], max: 2, dir:[0]},
            {airline: "EJU", aircraft: ["A320"], max: 2, dir: [0,3]},
            {airline: "VOE", aircraft: ["A320"], max: 2, dir: [3]},
            {airline: "VLG", aircraft: ["A320", "A321"], max: 2, dir:[3]},
            {airline: "QTR", aircraft: ["A330", "B787"], max: 1, dir:[1,3]},
            {airline: "UAE", aircraft: ["A330", "B777", "A380"], max: 1, dir: [1,3]},
            {airline: "ACA", aircraft: ["A330"], max: 1, dir: [3]},
            {airline: "DAL", aircraft: ["A330"], max: 1, dir: [3]},
        ],
        limits:  [ // technically, it's redundant to repeat these on every airport. However, it can also be useful in a future case of simulating e.g. airport hot n' high conditions, etc.
            {type: "A320", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "A321", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "AT4", minIas: 100, maxIas: 250, rateOfClimb: 29, optClimb: 200, maxAlt: 24, fuelBurn: 4, xWind:26},
            {type: "AT7", minIas: 105, maxIas: 250, rateOfClimb: 28, optClimb: 210, maxAlt: 24, fuelBurn: 5, xWind:26},
            {type: "B738", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "MAX", minIas: 140, maxIas: 330 , rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "A330", minIas: 150, maxIas: 320, rateOfClimb: 39, optClimb: 240, maxAlt: 32, fuelBurn: 20, xWind:34},
            {type: "B787", minIas: 150, maxIas: 320, rateOfClimb: 39, optClimb: 240, maxAlt: 32, fuelBurn: 20, xWind:34},
            {type: "B777", minIas: 150, maxIas: 320, rateOfClimb: 36, optClimb: 250, maxAlt: 31, fuelBurn: 25, xWind:35},
            {type: "A380", minIas: 160, maxIas: 320, rateOfClimb: 36, optClimb: 250, maxAlt: 31, fuelBurn: 25, xWind:35},
        ],
        diversions: diversions = [
            {airport: "LGTS", exitWP:"SIGFO"},
            {airport: "LGIR", exitWP: "VELOP"},
            {airport: "LGKO", exitWP: "VARIX"},
            {airport: "LGKR", exitWP: "XANIS"}
        ],
    },
    {   area: "LGKL",
        backgroundImage: 'img/LGKL.webp',
        runways: [
            {xStart: 52.5, yStart: 49, xEnd: 52.2, yEnd: 46.5, rwy: "17", textX: 24.5, textY:10, textXR: -4.5, textYR: -30, rRwy: "35", rwyDirection: 170},// typically it's 17R and 35L because of parallel used as taxiway, but omitted in the simulation to avoid confusion over having only one visible runway
        ],
         fixes: [
            {rwyDir: 350, fafX: 53.5, fafY: 55.5, iafX: 55.2, iafY:64.5},
            {rwyDir: 170, fafX: 51.5, fafY: 41, iafX: 50.5, iafY: 33}
        ],
        navpoints: [
            [62, 31, "TRL"],
            [36, 93, "TITUS"],
            [86, 39, "VELOP"],
            [44, 31, "BERAP"],
            [62, 6, "NEMES"],
            [23, 9, "ZAK"],
            [87, 94, "SOKRI"],
            [23, 31, "RESPA"],
            [85, 22, "DDM"]
        ],
        exitpoints: ["RESPA", "TITUS", "SOKRI", "NEMES", "DDM"],
        flights:  [
            {airline: "AEE", aircraft: ["A320", "A321"], max: -1, dir: [0,1,3]}, // dir = possible arrival directions, respectively N, E, S, W
            {airline: "OAL", aircraft: ["AT4", "AT7"], max: -1, dir: [0,1,3]},
            {airline: "SEH", aircraft: ["AT7", "A320", "A321"], max: -1, dir: [0,1,3]},
            {airline: "WZZ", aircraft: ["A320", "A321"], max: 2, dir: [0,3]},
            {airline: "RYR", aircraft: ["B738", "MAX"], max: 3, dir:[0,3]},
            {airline: "EJU", aircraft: ["A320"], max: 2, dir: [0,3]},
            {airline: "VOE", aircraft: ["A320"], max: 2, dir: [3]},
        ],
        limits:  [
            {type: "A320", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "A321", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "AT4", minIas: 100, maxIas: 250, rateOfClimb: 29, optClimb: 200, maxAlt: 24, fuelBurn: 4, xWind:26},
            {type: "AT7", minIas: 105, maxIas: 250, rateOfClimb: 28, optClimb: 250, maxAlt: 24, fuelBurn: 5, xWind:26},
            {type: "B738", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "MAX", minIas: 140, maxIas: 330 , rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
        ],
        diversions: diversions = [
            {airport: "LGAV", exitWP:"DDM"},
            {airport: "LGIR", exitWP: "SOKRI"},
        ],
    },
    {   area: "LGTS",
        backgroundImage: 'img/LGTS.webp',
        runways: [
            {xStart: 44, yStart: 50, xEnd: 45.5, yEnd: 50.5, rwy: "28", textX: -30, textY:15, textXR: 24.5, textYR: 10, rRwy: "10", rwyDirection: 280},
            {xStart: 44.5, yStart: 49.5, xEnd: 45, yEnd: 52, rwy: "16", textX: 8.5, textY:-5, textXR: -4.5, textYR: 38, rRwy: "34", rwyDirection: 160},
        ],
         fixes: [
            {rwyDir: 100, fafX: 40, fafY: 48.5, iafX: 34, iafY:46.5},
            {rwyDir: 280, fafX: 49.5, fafY: 51.5, iafX: 55, iafY: 52.5},
            {rwyDir: 160, fafX: 43.8, fafY: 44.7, iafX: 42, iafY:35.5},
            {rwyDir: 340, fafX: 45.7, fafY: 56.5, iafX: 47.5, iafY: 64}
        ],
        navpoints: [
            [71, 42, "PEREN"],
            [74, 12, "LASBU"],
            [31, 62, "LOPOS"],
            [28, 28, "ALIKO"],
            [56, 93, "AGISA"],
            [53, 8, "ODIKO"],
            [54, 68, "OSMOS"],
            [23, 99, "LUSES"],
            [22, 75, "KOGIS"],
        ],
        exitpoints: ["KOGIS", "LUSES", "AGISA", "ODIKO", "PEREN", "ALIKO"],
        flights:  [
            {airline: "AEE", aircraft: ["A320", "A321"], max: -1, dir: [0,2,3]}, // dir = possible arrival directions, respectively N, E, S, W
            {airline: "OAL", aircraft: ["AT4", "AT7"], max: -1, dir: [0,1,2,3,]},
            {airline: "SEH", aircraft: ["AT7", "A320", "A321"], max: -1, dir: [0,2,3]},
            {airline: "CYP", aircraft: ["A320"], max: 2, dir:[2]},
            {airline: "WZZ", aircraft: ["A320", "A321"], max: 2, dir: [0,3]},
            {airline: "RYR", aircraft: ["B738", "MAX"], max: 3, dir:[0,2,3]},
            {airline: "FIN", aircraft: ["A320", "A321"], max: 2, dir:[0]},
            {airline: "EJU", aircraft: ["A320"], max: 2, dir: [0,3]},
            {airline: "THY", aircraft: ["B738", "MAX", "A320", "A321"], max: 1, dir: [1]},
        ],
        limits:  [
            {type: "A320", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "A321", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "AT4", minIas: 100, maxIas: 250, rateOfClimb: 29, optClimb: 200, maxAlt: 24, fuelBurn: 4, xWind:26},
            {type: "AT7", minIas: 105, maxIas: 250, rateOfClimb: 28, optClimb: 210, maxAlt: 24, fuelBurn: 5, xWind:26},
            {type: "B738", minIas: 140, maxIas: 330, rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
            {type: "MAX", minIas: 140, maxIas: 330 , rateOfClimb: 55, optClimb: 260, maxAlt: 34, fuelBurn: 10, xWind:33},
        ],
        diversions: diversions = [
            {airport: "LGLM", exitWP: "PEREN"},
            {airport: "LGAV", exitWP: "AGISA"},
            {airport: "LGKR", exitWP: "ALIKO"}
        ],
    },
];


// setting default variables from the first option above just to have something to run. On the front end, a menu option handles actual choice.
area = theMaps[0].area;
backgroundImage = theMaps[0].backgroundImage;
runways = theMaps[0].runways;
fixes = theMaps[0].fixes;
navpoints = theMaps[0].navpoints;
exitpoints = theMaps[0].exitpoints;
flights = theMaps[0].flights;
limits = theMaps[0].limits;
diversions = theMaps[0].diversions;
