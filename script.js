let maxAircraft = 4;
let currentAircraft = 0;
let currentAircraftArray = [];
let refreshRate = 20000;
let theWind = randInt(0, 359);
let theWindSpeed = randInt(1, 40);
let windChange = 0.8;
let xWindComp = "";
let crosswindActive = false;
let windGustPercent = 0;
let gustValue = theWindSpeed + randInt(2,6);//just to have an initial value
let diversionCount = 0;
let runwayDirection, rRunwayDirection;
let activeRunways = [];
let activeRunwayThreshold, activeRunway;
let iaf, faf;
let trafficInterval;
let trafficType = 0.5;
let depCooldown = 40;
let elapsedTime = 0;
let planesHandled = 0;
let successfulDeps = 0;
let successfulAriv = 0;
let missedAproaches = 0;
let lossOfSeparationSeconds = 0;
let strayedAircraft = 0;
let emergenciesOn = false;
let emergencyProbability = 0.1;
let emergencyCount = 0;
let fuelEmergencyCount = 0;
let fromLoad = false;
let timeInCrosswind = 0;
let countingCrosswind = false;
let arrivingRwy;

let select = document.createElement('select');
select.id = 'mapChoice';
for (let i=0;i<theMaps.length;i++) {
    let opt = document.createElement('option');
    opt.value = theMaps[i].area;
    opt.textContent = theMaps[i].area;
    select.appendChild(opt);
}
document.getElementById("maps").appendChild(select);
$('#mapChoice').on('change', function() {
    let map = $(this).val();
    let obj = findInObjArr(theMaps, "area", map);
    let ind = theMaps.indexOf(obj);

    area = theMaps[ind].area;
    backgroundImage = theMaps[ind].backgroundImage;
    runways = shuffle(theMaps[ind].runways);
    nonParallel = theMaps[ind].nonParallel;
    fixes = theMaps[ind].fixes;
    navpoints = theMaps[ind].navpoints;
    exitpoints = theMaps[ind].exitpoints;
    flights = theMaps[ind].flights;
    limits = theMaps[ind].limits;
    diversions = theMaps[ind].diversions;

    $(radarDiv).css("backgroundImage", "url(" + backgroundImage + ")");
});

let radarDiv = document.getElementById('radar');
let canvas = document.createElement('canvas');
radarDiv.appendChild(canvas);

$(radarDiv).css("backgroundImage", "url(" + backgroundImage + ")");

const bgImage = new Image();
let imgScale = 1;
let imgOffsetX = 0;
let imgOffsetY = 0;

$("#helpBtn").click(function(){
    visibilitySwap("#help", "#helpBtn", "Exit Help");
});
$("#settingsBtn").click(function(){
    visibilitySwap("#settings", "#settingsBtn", "Exit Settings");
});
$("#exitHelpBtn").click(function(){
    visibilitySwap("#help", "#helpBtn", "Exit Help", true);
});
$("#exitSettingsBtn").click(function(){
    visibilitySwap("#settings", "#settingsBtn", "Exit Settings", true);
});
$("#inGameExitHelpBtn").click(function(){
   $("#inGameHelp").fadeOut(250);
});

$("#trafficBtnDiv button").click(function(){
    $("#trafficBtnDiv button").each(function(el){
        this.classList.remove("active")
    });
    this.classList.add("active");
    let choice = this.innerHTML;
    if (choice.startsWith("Both")) {
        trafficType = 0.5;
    }
    else if (choice.startsWith("Departing")) {
        trafficType = 0;
    }
    else { // landing only
        trafficType = 1;
    }
});

$("#difficultyBtnDiv button").click(function(){
    $("#difficultyBtnDiv button").each(function(el){
        this.classList.remove("active")
    });
    this.classList.add("active");
    let choice = this.innerHTML;

    if (choice == "Easy") {
        maxAircraft = 4;
        refreshRate = 20000;
        windChange = 0.8;
        $("#maxAircraftInput").val(4);
        $("#windChangeProb").val(20);
        $("#aircraftSpawnRate").val(20);
        $("#chosenMax").html(4);
        $("#chosenWind").html(20);
        $("#chosenRate").html(20);
    }
    else if (choice == "Medium") {
        maxAircraft = 6;
        refreshRate = 15000;
        windChange = 0.5;
        $("#maxAircraftInput").val(6);
        $("#windChangeProb").val(50);
        $("#aircraftSpawnRate").val(15);
        $("#chosenMax").html(6);
        $("#chosenWind").html(50);
        $("#chosenRate").html(15);
    }
    else { //hard
        maxAircraft = 8;
        refreshRate = 5000;
        windChange = 0.2;
        $("#maxAircraftInput").val(8);
        $("#windChangeProb").val(80);
        $("#aircraftSpawnRate").val(5);
        $("#chosenMax").html(8);
        $("#chosenWind").html(80);
        $("#chosenRate").html(5);
    }
});

$("#emergBtn").click(function(){
    if (this.innerHTML == "Emergencies Off") {
        this.innerHTML = "Emergencies On";
        this.style.backgroundColor = "darkgreen";
        emergenciesOn = true;
        $("#emergencyRange").css("opacity", "1");
    }
    else {
        this.innerHTML = "Emergencies Off";
        this.style.backgroundColor = "darkred";
        emergenciesOn = false;
        $("#emergencyRange").css("opacity", "0.3");
    }
})
$("#xWindBtn").click(function(){
    if (this.innerHTML == "Crosswind Inactive") {
        this.innerHTML = "Crosswind Active";
        this.style.backgroundColor = "darkgreen";
        crosswindActive = true;
        $("#crossWindRange").css("opacity", "1");
    }
    else {
        this.innerHTML = "Crosswind Inactive";
        this.style.backgroundColor = "darkred";
        crosswindActive = false;
        $("#crossWindRange").css("opacity", "0.3");
    }
})

$("#maxAircraftInput").val(4);
$("#windChangeProb").val(20);
$("#aircraftSpawnRate").val(20);
$("#emergencyProb").val(1);
$("#gustSpeedRange").val(2);
$("#maxAircraftInput").on("input change", function() {
    let str = this.value;
    $("#chosenMax").html(str);
    maxAircraft = parseInt(str);
});
$("#windChangeProb").on("input change", function() {
    let str = this.value;
    $("#chosenWind").html(str);
    windChange = parseInt(str)/100;
});
$("#aircraftSpawnRate").on("input change", function() {
    let str = this.value;
    $("#chosenRate").html(str);
    refreshRate = parseInt(str)*1000;
});
$("#emergencyProb").on("input change", function() {
    let str = this.value * 10;
    $("#chosenEmerg").html(str);
    emergencyProbability = parseFloat(this.value)/10;
});
$("#gustSpeedRange").on("input change", function() {
    let str = this.value * 10;
    $("#chosenGust").html(str);
    windGustPercent = parseInt(str)/100;
});

function visibilitySwap(el, elBtn, str, forceClose = false) {
    if ($(el).css("display") != "none" || forceClose) {
        $(el).fadeOut(250, function(){
        	if ($("#help").css("display") == "none" && $("#settings").css("display") == "none") {
        		$("#footer").show();
        	}
        });
        let str2 = "Settings";
        if (str == "Exit Help") {
        	str2 = "Help";
        }
        $(elBtn).html(str2);
        $(elBtn).css("backgroundColor", "blue");
    }
    else {
    	$("#footer").hide();
        $(el).fadeIn(500);
        $(elBtn).html(str);
        $(elBtn).css("backgroundColor", "darkred");
    }
}

bgImage.onload = () => {
    $("#commandBox").val("");
    var input = document.getElementById("commandBox");
    input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("commandButton").click();
    }
    });
    $("#commandButton").click(function(){
        let command = $("#commandBox").val();
        issueCommand(command);
    });

    function resizeCanvas() {
        const rect = radarDiv.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    calculateImageCover();
    window.addEventListener('resize', function(){
    resizeCanvas();
    calculateImageCover();
    });

    const ctx = canvas.getContext('2d');
    let lastTime = 0;
    const fps = 1;
    const interval = 1000 / fps;

    function draw(timestamp) {
        //draw with 1 fps
        if (timestamp - lastTime >= interval) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "darkgray";
            ctx.fillStyle = "darkgray";
            ctx.font = "12px Serif";
            ctx.lineWidth = 3;

            activeRunways.length = 0; // always reset, to keep up-to-date with wind changes on every refresh;
            //airport runway(s)
            for (let i=0;i<runways.length;i++) {
                const x1 = pctToPx(runways[i].xStart, canvas.width);
                const y1 = pctToPx(runways[i].yStart, canvas.height);
                const x2 = pctToPx(runways[i].xEnd, canvas.width);
                const y2 = pctToPx(runways[i].yEnd, canvas.height);
                const textX = x1-runways[i].textX;
                const textY = y1+runways[i].textY;
                const textRX = x1-runways[i].textXR;
                const textRY = y1+runways[i].textYR;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                ctx.fillText(runways[i].rwy, textX, textY);
                ctx.fillText(runways[i].rRwy, textRX, textRY);

                runwayDirection = runways[i].rwyDirection;
                rRunwayDirection = runwayDirection + 180;
                if (rRunwayDirection > 359) {
                    rRunwayDirection = rRunwayDirection - 360;
                }
                if (Math.abs(headingDiff(runwayDirection, theWind)) > 90) {
                    let rwyCheck = findInObjArr(activeRunways, "name", runways[i].rRwy);
                    if (rwyCheck == null) {
                        activeRunways.push({name:runways[i].rRwy, dir: rRunwayDirection, threshold: {x:x1, y:y1}}); //NOTE: I deliberately place the rRwy threshold, to get it directly below, in activeRunwayThreshold
                    }
                }
                else {
                    let rwyCheck = findInObjArr(activeRunways, "name", runways[i].rwy);
                    if (rwyCheck == null) {
                        activeRunways.push({name:runways[i].rwy, dir: runwayDirection, threshold: {x:x2, y:y2}});// NOTE Ibid
                    }
                }
            }

            activeRunway = activeRunways[0];
            if (!activeRunways[1]) {
                arrivingRwy = activeRunways[0];
            }
            else {
                arrivingRwy = activeRunways[1];
            }
            activeRunwayThreshold = activeRunway.threshold; // In principle, this is the rRway threshold, to properly simulate a/c taking off

            //iaf, faf
            let f = findInObjArr(fixes, "rwyDir", arrivingRwy.dir);
            faf = {posX:f.fafX, posY:f.fafY};
            ctx.fillStyle = "rgba(255,166,0,1)"
            ctx.beginPath();
            ctx.arc(pctToPx(f.fafX, canvas.width), pctToPx(f.fafY, canvas.height), 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "rgba(255,166,0,0.4)"
            ctx.beginPath();
            ctx.arc(pctToPx(f.fafX, canvas.width), pctToPx(f.fafY, canvas.height), 15, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            iaf = {posX:f.iafX, posY:f.iafY};
            ctx.fillStyle = "rgba(0,200,0,1)"
            ctx.beginPath();
            ctx.arc(pctToPx(f.iafX, canvas.width), pctToPx(f.iafY, canvas.height), 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "rgba(0,200,0,0.4)"
            ctx.beginPath();
            ctx.arc(pctToPx(f.iafX, canvas.width), pctToPx(f.iafY, canvas.height), 25, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = "darkgray";

            //navpoints
            for (let i=0;i<navpoints.length;i++) {
                const x1 = pctToPx(navpoints[i][0], canvas.width);
                const y1 = pctToPx(navpoints[i][1], canvas.height);
                const textX = x1-15;
                const textY = y1-15;

                ctx.beginPath();
                ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillText(navpoints[i][2], textX, textY);
            }

            //wind
            let rwyStr = "";
            if (runways.length > 1) {
                rwyStr = "(s)";
            }
            let dirStr = "";
            for (let i=0;i<activeRunways.length;i++) {
                dirStr += (activeRunways[i].name );
                if (i != activeRunways.length-1) {
                    dirStr += "/";
                }
            }

            xWindComp = Math.round(getCrosswindComponent());
            let gustStr = "(G " + Math.round(gustValue) + " kn)";
            $("#wind").html("<p>Wind: " + theWind + "°, " + theWindSpeed + " kn " + gustStr + "<br>Active Runway" + rwyStr + ": " + dirStr + "<br>Crosswind Component: " + xWindComp + "kn </p>");
            //departure gap
            depCooldown++;

            // check aircraft proximity
            currentAircraftArray.forEach(function(obj){
                obj.proximWarn = false;
            });
            let separationCheck = proximityCheck(currentAircraftArray);
            if (separationCheck.length != 0) {
                for (let i=0;i<separationCheck.length;i++) { // TODO what if more than 2 aircraft?
                    let ind1 = separationCheck[i][0];
                    let ind2 = separationCheck[i][1];
                    let ac1 = currentAircraftArray[ind1];
                    let ac2 = currentAircraftArray[ind2];
                    let altAircraft1 = ac1.alt;
                    let altAircraft2 = ac2.alt;
                    if (Math.abs(altAircraft1 - altAircraft2) < 1000) {
                        ac1.proximWarn = true;
                        ac2.proximWarn = true;
                        lossOfSeparationSeconds++;

                        if (ac1.landing === true) {
                            ac1.gaReason = ", loss of separation…";
                            issueCommand(ac1.callsign + " ga");
                        }
                        if (ac2.landing === true) {
                            ac2.gaReason = ", loss of separation…";
                            issueCommand(ac2.callsign + " ga");
                        }
                    }
                }
            }

            //check/update aircraft data
            currentAircraftArray.forEach(obj => {
                let rateOfClimb = findInObjArr(limits, "type", obj.type).rateOfClimb;
                let target;
                if (obj.commands.cmd_dest != "") {
                    if (obj.landing === true) {
                        target = {
                            x: pctToPx(faf.posX, canvas.width), y: pctToPx(faf.posY, canvas.height)
                        }
                    }
                    else {
                        target = {
                            x: pctToPx(navpoints.find(subArray => subArray.includes(obj.commands.cmd_dest))[0], canvas.width), y: pctToPx(navpoints.find(subArray => subArray.includes(obj.commands.cmd_dest))[1], canvas.height)
                        };
                    }
                }
                let currentPos = updatePosition(obj, target);
                obj.posX = currentPos.x;
                obj.posY = currentPos.y;

                //check if within radar area
                if (obj.posX > canvas.width + 15 || obj.posX < -15 || obj.posY > canvas.height + 15 || obj.posY < -15) {
                        showMsg("<p>" + obj.callsign + " strayed outside the radar area…</p>", "darkred");
                        obj.el[0].parentElement.remove();
                        currentAircraftArray = currentAircraftArray.filter(item => item !== obj);
                        currentAircraft--;
                        strayedAircraft++;
                }

                if (obj.commands.cmd_hdg != undefined && obj.commands.cmd_hdg != currentPos.hdg) {
                    if (isAngleToTheRight(obj.commands.cmd_hdg, currentPos.hdg)) {
                        obj.hdg -= 5; //TODO specify turn left or right
                    }
                    else {
                        obj.hdg += 5; //TODO ibid
                    }
                    if (angleDistance(obj.commands.cmd_hdg, obj.hdg) < 6) {
                        obj.hdg = obj.commands.cmd_hdg;
                        obj.commands.cmd_dest = obj.turningToDest; // ending the first turn, we do a heading adjust to address heading drift when calculating the original angle
                        obj.turningToDest = "";
                    }
                }
                if (target != undefined) {
                    obj.commands.cmd_dest = ""; // clearing dest after getting bearing to perform the turn
                }

                ctx.lineWidth = 2;
                ctx.strokeStyle = "yellow";
                let x = pxToPct(obj.posX, canvas.width);
                let y = pxToPct(obj.posY, canvas.height);
                if (!obj.arrivingStatus) {
                    ctx.strokeStyle = "cyan";
                }

                if (obj.proximWarn == true) {
                    ctx.strokeStyle = "red";
                }

                const points = [
                    {x: x, y: y},
                    {x: x+0.5, y: y-0.5},
                    {x: x+1, y: y},
                    {x: x+0.5, y: y+0.5}
                ];
                ctx.beginPath();
                ctx.moveTo(pctToPx(points[0].x, canvas.width), pctToPx(points[0].y, canvas.height));
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(pctToPx(points[i].x, canvas.width), pctToPx(points[i].y, canvas.height));
                }
                ctx.closePath();
                ctx.stroke();

                //tail
                if (obj.ias != 0) {
                    const tailStartPoint = {x:x+0.5, y:y};
                    const tailHdg = obj.hdg + 180;
                    const tailVector = headingToVector(tailHdg);
                    const tailLengthPct = scale(obj.ias, 100, 330, 1, 4)/1.5;
                    const tailEndX = tailStartPoint.x + tailVector.ux * tailLengthPct;
                    const tailEndY = tailStartPoint.y + tailVector.uy * tailLengthPct;
                    ctx.beginPath();
                    ctx.moveTo(pctToPx(tailStartPoint.x, canvas.width), pctToPx(tailStartPoint.y, canvas.height));
                    ctx.lineTo(pctToPx(tailEndX, canvas.width), pctToPx(tailEndY, canvas.height));
                    ctx.stroke();
                }

                // aircraft text
                ctx.font = "14px Arial";
                ctx.fillStyle = "yellow";
                if (!obj.arrivingStatus) {
                    ctx.fillStyle = "cyan";
                }
                if (obj.proximWarn == true) {
                    ctx.fillStyle = "red";
                }

                let hdgDisplay = Math.round(obj.hdg);
                let vector = hdgDisplay + "°";
                if (hdgDisplay < 0) {
                    vector = hdgDisplay + 360 + "°"
                }

                ctx.fillText(obj.callsign, pctToPx(x-1.5, canvas.width), pctToPx(y-7, canvas.height));
                ctx.fillText((Math.round(obj.alt) + " ft " + obj.ias + " kn"), pctToPx(x-1.5, canvas.width), pctToPx(y-5, canvas.height));
                ctx.fillText(vector, pctToPx(x-1.5, canvas.width), pctToPx(y-3, canvas.height));

                // update speeds
                if (obj.ias < obj.commands.cmd_ias) {
                    obj.ias += randInt(2, 4);
                }
                else if (obj.ias > obj.commands.cmd_ias) {
                    obj.ias -= randInt(2, 4);
                }
                if (Math.abs(obj.ias - obj.commands.cmd_ias) < 4) {
                    obj.ias = obj.commands.cmd_ias;
                }

                //update altitude and calculate fuel burn
                let fuelBurn = findInObjArr(limits, "type", obj.type).fuelBurn;
                if (obj.alt < obj.commands.cmd_alt) {
                    obj.alt += rateOfClimb * climbFactor(obj.ias, findInObjArr(limits, "type", obj.type).minIas, findInObjArr(limits, "type", obj.type).maxIas, findInObjArr(limits, "type", obj.type).optClimb);
                    obj.fuel -= fuelBurn*0.45;
                }
                else if (obj.alt > obj.commands.cmd_alt) {
                    obj.alt -= 35;
                    obj.fuel -= fuelBurn*0.15;
                }
                else { // level flight, we just calculate fuel burn
                    obj.fuel -= fuelBurn*0.25;
                }
                if (Math.abs(obj.alt - obj.commands.cmd_alt) < 50) { // for consistency, this needs to be higher than the highest rate of climb
                    obj.alt = obj.commands.cmd_alt;
                }

                //check arriving at point (for strip name change), exit, landing
                if (obj.waypointName != "") {
                    let prox = 4;
                    if (obj.hold === true) {
                        prox = 3;
                    }
                    let reachNavpoint = areaProximity(obj, obj.waypointName, prox, false);
                    if (reachNavpoint.length != 0) {
                        if (obj.hold === true) {
                            obj.commands.cmd_ias = 200;
                            obj.commands.cmd_dest = obj.waypointName;
                            obj.turningToDest = obj.commands.cmd_dest;
                        }
                        else {
                            obj.waypointName = "";
                        }
                    }
                }
                else if (obj.destination != "") { //check arrival to exit point
                    let exitpoint = areaProximity(obj, obj.destination, 4, false);
                    if (exitpoint.length != 0 && obj.alt >= obj.transitionAlt) {
                        showMsg("<p>" + obj.callsign + " handed over to the next controller.</p>", "darkgreen");
                        obj.el[0].parentElement.remove();
                        currentAircraftArray = currentAircraftArray.filter(item => item !== obj);
                        currentAircraft--;
                        successfulDeps++;
                    }
                }
                else if (obj.arrivingStatus === true){//check arrival to iaf/faf
                    let inIaf = areaProximity(obj, iaf, 5, true);
                    let atFaf = areaProximity(obj, faf, 3.5, true);
                    let finalApproachSpeedPoint = areaProximity(obj, faf, 6, true);
                    if (inIaf.length != 0 && angleDistance(obj.hdg, arrivingRwy.dir) < 50 && obj.approaching === true && obj.landing === false && obj.ias <= 220) {
                        obj.landing = true;
                        obj.commands.cmd_dest = faf;
                        obj.commands.cmd_ias = findInObjArr(limits, "type", obj.type).minIas * 1.3;
                        obj.commands.cmd_alt = 1000;
                        showMsg("<p>" + obj.callsign + " on final…" + "</p>", "darkgreen");
                    }
                    if (finalApproachSpeedPoint.length != 0 && obj.landing === true) {
                        obj.commands.cmd_ias = findInObjArr(limits, "type", obj.type).minIas;
                    }
                    if (atFaf.length != 0 && obj.landing === true) {
                        obj.onShortFinal = true;
                        if (obj.ias <= findInObjArr(limits, "type", obj.type).minIas + 10 && obj.alt == 1000) {
                            if (crosswindActive && getCrosswindComponent() >= findInObjArr(limits, "type", obj.type).xWind) {
                                countingCrosswind = true;
                                obj.crosswindGA++;
                                obj.gaReason = ", crosswind above limit…";
                                issueCommand(obj.callsign + " ga");
                                if (obj.crosswindGA >= obj.crosswindGAlimit) {
                                    setTimeout(function(){ // deciding for diversion if limit reached
                                        let diversion = getRandomItem(diversions);
                                        showMsg("<p>" + obj.callsign + " diverts to " + diversion.airport + "…</p>", "darkred");
                                        obj.arrivingStatus = false;
                                        diversionCount++;
                                        obj.destination = diversion.exitWP;
                                        obj.transitionAlt = randInt(4, 8)*1000;
                                    }, randInt(6000, 50000));
                                }
                            }
                            else {
                                showMsg("<p>" + obj.callsign + " handed over to tower.</p>", "darkgreen");
                                obj.el[0].parentElement.remove();
                                currentAircraftArray = currentAircraftArray.filter(item => item !== obj);
                                currentAircraft--;
                                successfulAriv++;
                            }
                        }
                    }
                    if (obj.onShortFinal === true && atFaf.length == 0) {
                        obj.gaReason = ", non stabilized approach…";
                        issueCommand(obj.callsign + " ga");
                    }
                }

                //Emergencies
                if (emergenciesOn) {
                    if (obj.fuel < findInObjArr(limits, "type", obj.type).fuelBurn*85 && obj.lowFuel === false) {
                        obj.lowFuel = true;
                        showMsg("<p>" + obj.callsign + " is low on fuel…</p>", "darkred");
                    }
                    else if (obj.fuel < findInObjArr(limits, "type", obj.type).fuelBurn*50 && obj.fuelEmerg === false) {
                        obj.fuelEmerg = true;
                        showMsg("<p>" + obj.callsign + " declares a fuel emergency…</p>", "darkred");
                        let newCall = splitString(obj.callsign);
                        obj.callsign = "MAYDAY" + newCall[1];
                        fuelEmergencyCount++;
                        emergencyCount++;
                        $(obj.el[0].parentElement.parentElement).off();
                        $(obj.el[0].parentElement.parentElement).click(function(){
                            $("#commandBox").val(obj.callsign + " ");
                            $("#commandBox").focus();
                        })
                    }
                    else if (obj.fuel <= 0) {
                        showMsg("<p>" + obj.callsign + " has been removed from your control…</p>", "darkred");
                        obj.el[0].parentElement.remove();
                        currentAircraftArray = currentAircraftArray.filter(item => item !== obj);
                        currentAircraft--;
                        strayedAircraft++;
                    }

                    if (obj.willBeEmerg === true && elapsedTime >= obj.emergTime && obj.isEmergency === false) {
                        obj.isEmergency = true;
                        showMsg("<p>" + obj.callsign + " declares an emergency. " + capFirstLetter(obj.emergStr) + "…</p>", "darkred");
                        let newCall = splitString(obj.callsign);
                        obj.callsign = "MAYDAY" + newCall[1];
                        obj.arrivingStatus = true;
                        obj.destination = "";
                        obj.transitionAlt = 0;
                        emergencyCount++;
                        $(obj.el[0].parentElement.parentElement).off();
                        $(obj.el[0].parentElement.parentElement).click(function(){
                            $("#commandBox").val(obj.callsign + " ");
                            $("#commandBox").focus();
                        })
                    }
                }

                refreshAirData(obj);
            });

            lastTime = timestamp;
            elapsedTime++;
            if (countingCrosswind) {
            	timeInCrosswind++;
            	if (timeInCrosswind > 600 ) {//force a drop of wind after 10 min of crosswind
            		theWindSpeed = randInt(1, 8);
            		gustValue = theWindSpeed * 0.5;
            		timeInCrosswind = 0;
            		countingCrosswind = false;
            	}
            }
    }
    requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
};
bgImage.src = backgroundImage;

function boot() {
    $("#intro").fadeOut(300, function(){
        $("#intro").remove();
    });
    if (!fromLoad) {
        spawnAircraft();// spawn first aircraft on boot (but not if a previous instance has been just loaded)
    }
    trafficInterval = setInterval(function(){
        // refresh wind and active runway

        let landingAircraft = 0;
        currentAircraftArray.forEach(function(el){
            if (el.landing === true) {
                landingAircraft++;
            }
        })

        if (Math.random() > windChange && landingAircraft == 0) { // don't change wind when a/c are landing
            let factor1 = randInt(-10, 10);
            let factor2 = randInt(-2, 2);
            theWind = theWind+factor1;
            if (theWind < 1) {
                theWind = 360 + theWind;
            }
            else if (theWind > 360) {
                theWind = theWind - 360;
            }
            theWindSpeed = theWindSpeed + factor2;
            if (theWindSpeed < 1) {
                theWindSpeed = 1;
            }
        }

        //spawn aircraft
        if (currentAircraft == maxAircraft) {
            return;
        }
        if (currentAircraft < 2) {
            spawnAircraft();
            return;
        }
        if (Math.random() > 0.5) { //TODO perhaps adjust judging by how many current aircraft
            spawnAircraft();
        }

        //wind gusts; calculated here for timing purposes
        let randomizingFactor = randInt(5, 10)/10
        gustValue = Math.max(theWindSpeed+2, (theWindSpeed + theWindSpeed*windGustPercent*randomizingFactor));

    }, refreshRate);
}

function spawnAircraft() {
    shuffle(flights);
    let flightObj = getFlight(0);

    let callsign = flightObj.airline + generateCallsign();
    let incomingDirections = flightObj.dir;
    let type = getRandomItem(flightObj.aircraft);
    let destination = "";
    let currentDestination = "";
    let ias, alt, hdg;
    let posX, posY;
    let target = {};
    let arrivingStatus = true;
    let transitionAlt = 0;
    let fuel = 10000; // only relevant for arriving a/c (unless for emergency returning a/c). This is a placeholder.
    let willBeEmerg = false;
    let emergTime = 0; // only relevant for departing a/c. Placeholder
    let emergStr = "";
    let crosswindGAlimit = randInt(1,3);

    let d = document.createElement("div");
    let p = document.createElement("p");
    let sp1 = document.createElement("span");
    let sp2 = document.createElement("span");
    let sp3 = document.createElement("span");

	d.style.cursor = "pointer";
    d.appendChild(p);
    p.appendChild(sp1);
    p.appendChild(sp2);
    p.appendChild(sp3);

    let cmd_alt, cmd_ias; // needed to emulate departing a/c
    let contactStr;

    if (Math.random() > trafficType && depCooldown > 39) { // departing
        depCooldown = 0;
        destination = getRandomItem(exitpoints);
        arrivingStatus = false;
        p.classList.add("departing");
        posX = activeRunwayThreshold.x;
        posY = activeRunwayThreshold.y;
        ias = randInt(155, 168); //TODO set by a/c type
        cmd_ias = 250;
        hdg = activeRunway.dir;
        alt = randInt(6, 9)*100;
        cmd_alt = randInt(2, 5)*1000;
        transitionAlt = randInt(4, 8)*1000;
        contactStr = callsign + ", passing " + alt + " for " + cmd_alt;
        if (Math.random() < emergencyProbability) {
            willBeEmerg = true;
            if (Math.random() > 0.5) {
                emergTime = elapsedTime + randInt(5, 60); // take off emergency
                emergStr = getRandomItem(takeOffEmergencies);
            }
            else {
                emergTime = elapsedTime + randInt(250, 500) // later emergency
                emergStr = getRandomItem(laterEmergencies);
            }
        }
    }
    else { // arriving
        if (trafficType == 0) {
            return;
        }
        p.classList.add("arriving");

        let possibleDirections = [ // north, east, south, west
            {posX:randInt(pctToPx(30, canvas.width), pctToPx(70, canvas.width)), posY:-10, hdg:randInt(165, 195)},
            {posX:posX = canvas.width + 10, posY:randInt(pctToPx(30, canvas.height), pctToPx(70, canvas.height)), hdg:randInt(255, 285)},
            {posX:randInt(pctToPx(30, canvas.width), pctToPx(70, canvas.width)), posY:canvas.height+10, hdg:randInt(335, 385)%360},
            {posX: -10, posY:randInt(pctToPx(30, canvas.height), pctToPx(70, canvas.height)), hdg:randInt(75, 105)}
        ]

        let randomDirIndex = getRandomItem(incomingDirections); // selecting random direction from airline's possible options'
        posX = possibleDirections[randomDirIndex].posX;
        posY = possibleDirections[randomDirIndex].posY;
        hdg = possibleDirections[randomDirIndex].hdg

        fuel = findInObjArr(limits, "type", type).fuelBurn * randInt(200, 350);
        alt = randInt(3, 9)*1000;
        if (currentAircraftArray.length > 1 && alt == currentAircraftArray[currentAircraftArray.length-2].alt) { // just in case, set different altitude from the immediately previous a/c, to avoid two arrivals on the same altitude and from the same direction.
            alt += 1000;
        }
        ias = 250;
        cmd_alt = alt;
        cmd_ias = ias;
        contactStr = callsign + ", at " + alt + ", heading " + hdg;
    }

    let obj = {callsign: callsign, type: type, el:[sp1, sp2, sp3], ias: ias, alt: alt, hdg: hdg, destination: destination, target:target, commands:{cmd_ias: cmd_ias, cmd_alt:cmd_alt, cmd_hdg:hdg, cmd_dest:currentDestination}, posX:posX, posY:posY, arrivingStatus:arrivingStatus, proximWarn: false, turningToDest: "", landing: false, waypointName: "", approaching: false, hold:false, onShortFinal: false, transitionAlt: transitionAlt, fuel:fuel, lowFuel: false, fuelEmerg: false, willBeEmerg: willBeEmerg, emergTime:emergTime, isEmergency: false, emergStr: emergStr, crosswindGA:0, crosswindGAlimit};
    refreshAirData(obj, true);
    currentAircraft++;
    document.getElementById("strips").appendChild(d);
    $(d).click(function(){
    	$("#commandBox").val(obj.callsign + " ");
    	$("#commandBox").focus();	
    });

    planesHandled++;
    showMsg(("<p>" + contactStr + "</p>"), "darkgreen");
}

function getFlight(i) {
    let flight = flights[i];
    let airlineCheck = 0;
    for (let y=0;y<currentAircraftArray.length;y++) {
        if (flight.airline == currentAircraftArray[y].callsign.slice(0,3)) {
            airlineCheck++;
        }
    }
    if (airlineCheck < flight.max || flight.max == -1) {
        return flight;
    }
    else {
        return getFlight(i+1);
    }
}

function updatePosition(obj, target) {
	let x = obj.posX;
	let y = obj.posY;
	let speed = obj.ias;
	let angle = obj.hdg;

  	speed = scale(speed, 0, 330, 0, 4);
    const rad = ((angle - 90) % 360) * Math.PI / 180;
    const nx = Math.cos(rad);
    const ny = Math.sin(rad);

  // Use angle if provided
  if (typeof angle === 'number' && target == undefined) {

    return {
      x: x + nx * speed,
      y: y + ny * speed,
      hdg: angle
    };
  }

  // Otherwise move toward a fix
  const dx = target.x - x;
  const dy = target.y - y;
  const distance = Math.hypot(dx, dy);

  const directionDeg = vectorToDegrees(dx, dy);

  obj.commands.cmd_hdg = directionDeg;
  
  return {
    x: x + nx * speed,
    y: y + ny * speed,
    hdg: directionDeg
  };
}

function vectorToDegrees(dx, dy) {
  const rad = Math.atan2(dx, -dy);
  let deg = rad * 180 / Math.PI;
  return (deg + 360) % 360;

}

function headingToVector(deg) {
    const rad = (deg * Math.PI) / 180;
    const ux = Math.sin(rad);
    const uy = -Math.cos(rad);
    return {ux, uy};
}


function issueCommand(command) {
    $("#commandBox").val("");
	let callsign = command.split(" ")[0].toUpperCase();

    let str = "";
    let col = "darkred";

    if (command.trim().toLowerCase() == "save") {
        save();
        return;
    }
    if (command.trim().toLowerCase() == "load") {
        if ($("#loadButton").html() == "Cancel Load") {
            $("#loadButton").html("Load");
            $("#loadButton").css("backgroundColor", "blue");
            $("#fileLoad").fadeOut(250);
        }
        else {
            load();
        }
        return;
    }
    if (command.trim().toLowerCase() == "help") {
        $("#inGameHelp").fadeIn(500);
        return;
    }
    if (command.trim().toLowerCase() == "stats" || command.trim().toLowerCase() == "data") {
        let btnStr;
        if (command.trim().toLowerCase() == "stats") {
            btnStr = "Exit Stats";
        }
        else {
            btnStr = "Exit Data";
        }
        $("#statScreen").html("");
        let bt = document.createElement("button");
        bt.id = "statExitBtn";
        bt.style.margin = "20px auto";
        bt.innerHTML = btnStr;
        document.getElementById("statScreen").appendChild(bt);
        $(bt).click(function(){
            $("#statScreen").fadeOut(250);
        });
        if (command.trim().toLowerCase() == "stats") {
            let emergStats = "";
            let diversionStats = "";
            if (emergenciesOn) {
                emergStats = "<p>Emergencies: " + emergencyCount + ", of which fuel emergencies: " + fuelEmergencyCount + "</p>";
            }
            if (crosswindActive) {
                diversionStats = "<p>Diversions: " + diversionCount + "</p>";
            }
            $("#statScreen").append("<h3>Score and Statistics</h3><p>Elapsed Time: " + Math.round(elapsedTime/60) + " minutes</p><p>Planes Handled: " + planesHandled + "</p><p>Successful Departures: " + successfulDeps + "</p><p>Successful Arrivals: " + successfulAriv + "</p><p>Missed Approaches: " + missedAproaches + "</p><p>Seconds with Loss of Separation: " + lossOfSeparationSeconds + "</p><p>Strayed Aircraft: " + strayedAircraft + "</p><p>Aircraft Handled per Minute: " + Math.round(planesHandled/elapsedTime*60) + "</p>" + emergStats + diversionStats);
        }
        else {
            $("#statScreen").append("<h3>Aircraft Reference Data</h3>")
            let div = document.createElement("div");
            for (let i=0;i<limits.length;i++) {
                let p = document.createElement("p");
                p.classList.add("aircraftData");
                p.innerHTML = "";
                p.innerHTML += "<span style='font-weight:bold;background:saddlebrown;border-radius:6px;padding: 0 4px'>Type: " + limits[i].type + "</span><br>Minimum Speed: " + limits[i].minIas + " kn<br>Maximum Speed: " + limits[i].maxIas + " kn<br>Optimal Climb Speed: " + limits[i].optClimb + " kn<br>Maximum Sector Altitude: " + limits[i].maxAlt + ",000 ft<br>Fuel Consumption: " + limits[i].fuelBurn*150 + "kg/hr<sup>*</sup><br>Maximum crosswind component: " + limits[i].xWind + " kn<br><span style='font-size:10px'><sup>*</sup>Simulated</p>";
                div.appendChild(p);
            }
            $("#statScreen").append(div);
        }
        $("#statScreen").fadeIn(500);
        return;
    }

	let flight = findInObjArr(currentAircraftArray, "callsign", callsign);

	let commandType = command.split(" ")[1];
	let commandContent = command.split(" ")[2];

    if (flight == null) {
		showMsg("<p>No such flight. Check callsign.</p>", col);
		return;
	}
	if (flight.landing === true && commandType.toLowerCase() != "ga") {
        showMsg("<p>" + callsign + " is already on final…</p>", col);
        return;
    }

	let aircraftType = flight.type;
	let minIas = findInObjArr(limits, "type", aircraftType).minIas;
	let maxIas = findInObjArr(limits, "type", aircraftType).maxIas;
	
	if (commandType.toLowerCase() == "s") {
 		if (commandContent < minIas) {
			str = "Unable, speed too low…";
		}
		else if (commandContent > maxIas) {
			str = "Unable, speed too high…";
		}
		else if (!isNaN(commandContent)){ // verifying it's a number
            str = flight.callsign + ", speed " + commandContent;
            col = "darkgreen";
            flight.commands.cmd_ias = parseInt(commandContent, 10);
        }
        else {
            str = "Unknown command…";
        }
	}
	else if (commandType.toLowerCase() == "c") {
		if (isNaN(commandContent)) {
			if (navpoints.find(subArray => subArray.includes(commandContent.toUpperCase())) == null) {
				str = "Unknown waypoint. Check command…";
			}
			else {
                str = flight.callsign + ", direct " + commandContent.toUpperCase();
                col = "darkgreen";
                flight.commands.cmd_dest = commandContent.toUpperCase();
                flight.turningToDest = flight.commands.cmd_dest;
                flight.waypointName = "";
                flight.hold = false; // cancel possible holds
                flight.waypointName = flight.turningToDest;
            }
		}
		else if (commandContent.length == 3) {
			let hdg;
			if (commandContent[0]==0) {
				hdg = parseInt(commandContent[1]+""+commandContent[2]);
			}
			else {
				hdg = parseInt(commandContent);
			}
			if (hdg < 0 || hdg > 359) { //TODO maybe allow - and =, to indicate "turn 10 degs to the left/right"
				str = "Unable, check heading…";
			}
			else {
                str = flight.callsign + ", turn heading " + hdg;
                col = "darkgreen";
                flight.commands.cmd_hdg = hdg;
                flight.commands.cmd_dest = "";
                flight.waypointName = "";
                flight.hold = false; // cancel possible holds
            }
		}
		else if (commandContent.length == 2 || commandContent.length == 1) {
            let maxAlt = findInObjArr(limits, "type", aircraftType).maxAlt;
			if (commandContent < 1) {
				str = "Unable, altitude too low…";
			}
			else if (commandContent > maxAlt ) {
				str = "Unable, altitude too high…";
			}
			else {
                let altStr = "descend";
                if (flight.alt < commandContent*1000) {
                    altStr = "climb";
                }

                str = flight.callsign + ", " + altStr + " and maintain " + commandContent*1000;
                col = "darkgreen";
                flight.commands.cmd_alt = commandContent*1000;
            }
		}
		else {
			str = "Unable, check command…";
		}
	}
	else if (commandType.toLowerCase() == "h") {
		if (navpoints.find(subArray => subArray.includes(commandContent.toUpperCase())) == null) {
			str = "Unknown waypoint. Check command…";
		}
		else {
            str = flight.callsign + ", hold " + commandContent.toUpperCase();
            col = "darkgreen";
            flight.commands.cmd_dest = commandContent.toUpperCase();
            flight.turningToDest = flight.commands.cmd_dest;
            flight.waypointName = flight.turningToDest;
            flight.hold = true;
            flight.approaching = false;
        }
    }
    else if (commandType.toLowerCase() == "a") {
        if (flight.arrivingStatus !== true) {
            str = "Not an arriving aircraft…";
        }
        else if (flight.approaching === false){
            let approachForIaf = areaProximity(flight, iaf, 15, true);
            if (approachForIaf.length != 0) {
                str = flight.callsign + ", cleared for the approach runway " + arrivingRwy.name;
                col = "darkgreen";
                flight.approaching = true;
                flight.hold = false
            }
            else {
                str = "Unable, " + flight.callsign + " is too far from the IAF…";
            }
        }
        else {
            str = flight.callsign + " is already cleared for the approach…";
        }
    }
    else if (commandType.toLowerCase() == "ca") {
        if (flight.arrivingStatus !== true) {
            str = "Not an arriving aircraft…";
        }
        else if (flight.approaching === true) {
            str = flight.callsign + ", cancel approach clearance…";
            flight.approaching = false;
        }
        else {
            str = flight.callsign + " is not cleared for the approach…";
        }
    }
    else if (commandType.toLowerCase() == "ga") {
        if (flight.landing !== true) {
            str = "Not a landing aircraft…";
        }
        else {
            flight.landing = false;
            flight.approaching = false;
            flight.onShortFinal = false;
            flight.commands.cmd_ias = 250;
            flight.commands.cmd_alt = 4000;
            flight.commands.cmd_dest = "";
            missedAproaches++;
            let reason = "…";
            if (flight.gaReason) {
                reason = flight.gaReason;
            }
            str = flight.callsign + ", going around" + reason;
        }
    }
	else {
		str = "Unknown command…";
	}

	//TODO check if end of command contains X (expedite)

	showMsg("<p>" + str + "</p>", col);
}

function showMsg(str, col) {
    let timer = 2500;
    if (col == "darkred") { // allow a bit more time for issues;
        timer = 4000;
    }
    $("#messages").css("backgroundColor", col);
	$("#messages").html(str);
	$("#messages").animate({opacity: 1}, 500);
	setTimeout(function(){
		$("#messages").animate({opacity: 0}, 250);
	}, timer);
}

function headingDiff(a, b) {
  let diff = (b - a) % 360;
  if (diff < -180) diff += 360;
  if (diff >  180) diff -= 360;
  return diff;
}

function findInObjArr(arr, key, value) {
	return arr.find(item => item != null && Object.prototype.hasOwnProperty.call(item, key) && item[key] === value) || null;
}

function refreshAirData(obj, firstCreate = false) {
    let vector = Math.round(obj.commands.cmd_hdg) + "°";
    if (obj.waypointName != "") {
        vector = obj.waypointName;
    }
    if (obj.approaching === true) {
        vector = "<span style='background-color:darkgreen; padding: 0 4px'>APPR</span>";
    }
    if (obj.landing === true) {
        vector = "<span style='background-color:darkgreen; padding: 0 4px'>LAND</span>";
    }
    if (obj.hold === true) {
        vector += " <span style='background-color:darkmagenta; padding: 0 4px'>(HOLD)</span>";
    }
    if (obj.isEmergency === true) {
        vector += " <span style='background-color:darkred; padding: 0 4px'>MAYDAY</span>";
        obj.el[0].parentElement.style.backgroundColor = "saddlebrown";
    }
    else if (obj.fuelEmerg === true) {
        vector += " <span style='background-color:darkred; padding: 0 4px'>MAYDAY FL</span>";
    }
    else if (obj.lowFuel === true) {
        vector += " <span style='background-color:darkorange; padding: 0 4px'>LOW FL</span>";
    }
    $(obj.el[0]).html(obj.callsign + " (" + obj.type + ")<br>");
    if (obj.arrivingStatus === false) {
        $(obj.el[1]).html(obj.destination + " " + obj.transitionAlt + "<br>");
        obj.el[0].parentElement.style.backgroundColor = "blue"; // this is meant for diverting aircraft
    }
    $(obj.el[2]).html(obj.commands.cmd_ias + " kn " + obj.commands.cmd_alt + " ft " + vector)
    if (firstCreate) {
        currentAircraftArray.push(obj);
    }
}

function pctToPx(pct, dim) {
    if (dim === canvas.width) {
        const imgX_px = (pct / 100) * bgImage.naturalWidth;
        return (imgX_px * imgScale) + imgOffsetX;
    } else {
        const imgY_px = (pct / 100) * bgImage.naturalHeight;
        return (imgY_px * imgScale) + imgOffsetY;
    }
}

function pxToPct(px, dim) {
    if (dim === canvas.width) {
        const scaledImageWidth = bgImage.naturalWidth * imgScale;
        return 100 * (px - imgOffsetX) / scaledImageWidth;
    } else {
        const scaledImageHeight = bgImage.naturalHeight * imgScale;
        return 100 * (px - imgOffsetY) / scaledImageHeight;
    }
}

// 3. This function does the 'background-size: cover' math
function calculateImageCover() {
    // This must run AFTER resizeCanvas()
    const containerWidth = canvas.width;
    const containerHeight = canvas.height;
    const imgWidth = bgImage.naturalWidth;
    const imgHeight = bgImage.naturalHeight;

    const containerRatio = containerWidth / containerHeight;
    const imgRatio = imgWidth / imgHeight;

    if (imgRatio > containerRatio) {
        // Image is wider: Fit to height, crop sides
        imgScale = containerHeight / imgHeight;
        imgOffsetX = (containerWidth - imgWidth * imgScale) / 2;
        imgOffsetY = 0;
    } else {
        // Image is taller: Fit to width, crop top/bottom
        imgScale = containerWidth / imgWidth;
        imgOffsetX = 0;
        imgOffsetY = (containerHeight - imgHeight * imgScale) / 2;
    }
}

function generateCallsign() {
    let letter = getRandomItem(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
    let number1 = randInt(0, 9);
    let number2 = randInt(10, 99);

    if (Math.random() > 0.5) {
        return number1 + letter + number2;
    }
    else {
        return number2 + letter + number1;
    }
}

function randInt(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomItem(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return Math.round((num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

function angleDistance(angle1, angle2) {
    angle1 = (angle1 % 360 + 360) % 360;
    angle2 = (angle2 % 360 + 360) % 360;
    let distance = Math.abs(angle1 - angle2);
    return Math.min(distance, 360 - distance);
}

function isAngleToTheRight(referenceAngle, targetAngle) {
    referenceAngle = (referenceAngle % 360 + 360) % 360;
    targetAngle = (targetAngle % 360 + 360) % 360;
    let difference = (targetAngle - referenceAngle + 360) % 360;
    return difference <= 180;
}

function areaProximity(flightObj, navpoint, dist = 4, fixMode = false) {
    let target;
    if (!fixMode) {
        target = {
            posX: pctToPx(navpoints.find(subArray => subArray.includes(navpoint))[0], canvas.width),
            posY:pctToPx(navpoints.find(subArray => subArray.includes(navpoint))[1], canvas.height)
        };
    }
    else {
        target = {
            posX: pctToPx(navpoint.posX, canvas.width),
            posY: pctToPx(navpoint.posY, canvas.height)
        };
    }
    return proximityCheck([flightObj, target], pctToPx(dist));
}

function proximityCheck(arr, z = pctToPx(6.5)) {
  const limitSq = z * z;// use squared distance for efficiency
  const n = arr.length;
  const result = [];
  for (let i = 0; i < n - 1; i++) {
    const a = arr[i];
    for (let j = i + 1; j < n; j++) {
      const b = arr[j];
      const dx = a.posX - b.posX;
      const dy = a.posY - b.posY;
      if (dx * dx + dy * dy < limitSq) {
        result.push([i, j]);// store the indices of the close pair
      }
    }
  }
  return result;
}

function climbFactor(s, min, max, opt) {
  if (s < min || s > max) return 0.5;
  if (s === opt) return 1.0;
  if (s <= opt) {
    const lowerRange = opt - min;
    if (lowerRange === 0) return 0.5;
    return 0.5 + 0.5 * ((s - min) / lowerRange);
  } else {
    const upperRange = max - opt;
    if (upperRange === 0) return 0.5;
    return 0.5 + 0.5 * ((max - s) / upperRange);
  }
}


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function splitString(str) {
    return [str.slice(0, 3), str.slice(3)];
}

function capFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCrosswindComponent() {
    let diff = Math.abs(theWind - arrivingRwy.dir);
    let theAngle = diff > 180 ? 360 - diff : diff;
    const theAngleInRadians = theAngle * Math.PI / 180;
    const xWind = gustValue * Math.sin(theAngleInRadians);
    return xWind;
}

function save() {
    let simVariables = {
        maxAircraft:maxAircraft,
        currentAircraft:currentAircraft,
        currentAircraftArray:currentAircraftArray,
        refreshRate:refreshRate,
        theWind:theWind,
        theWindSpeed:theWindSpeed,
        windChange:windChange,
        xWindComp:xWindComp,
        crosswindActive:crosswindActive,
        windGustPercent:windGustPercent,
        gustValue:gustValue,
        diversionCount:diversionCount,
        runwayDirection: runwayDirection,
        rRunwayDirection: rRunwayDirection,
        activeRunways:activeRunways,
        activeRunwayThreshold:activeRunwayThreshold,
        activeRunway:activeRunway,
        arrivingRwy:arrivingRwy,
        iaf:iaf,
        faf:faf,
        trafficType: trafficType,
        depCooldown:depCooldown,
        elapsedTime:elapsedTime,
        planesHandled:planesHandled,
        successfulDeps:successfulDeps,
        successfulAriv:successfulAriv,
        missedAproaches:missedAproaches,
        lossOfSeparationSeconds:lossOfSeparationSeconds,
        strayedAircraft:strayedAircraft,
        emergenciesOn:emergenciesOn,
        emergencyProbability:emergencyProbability,
        emergencyCount:emergencyCount,
        fuelEmergencyCount:fuelEmergencyCount,
        area:area,
    }
    const dataStr = JSON.stringify(simVariables, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'atcJS_save.txt';
    a.click();
    URL.revokeObjectURL(url);
}
function load() {
    $("#fileLoad").fadeIn(500);
    $("#loadButton").html("Cancel Load");
    $("#loadButton").css("backgroundColor", "darkred");
    $('#fileLoad').on('change', function(e){
        if (this.files[0].type.match('text/plain')) {
            readFile(this.files[0], function(e) {
                text = e.target.result;

                var loadedState = JSON.parse(text);
                $("#fileLoad").fadeOut(250);

                maxAircraft = loadedState.maxAircraft;
                currentAircraft = loadedState.currentAircraft;
                currentAircraftArray = loadedState.currentAircraftArray;
                refreshRate = loadedState.refreshRate;
                theWind = loadedState.theWind;
                theWindSpeed = loadedState.theWindSpeed;
                windChange = loadedState.windChange;
                xWindComp = loadedState.xWindComp;
                crosswindActive = loadedState.crosswindActive;
                windGustPercent = loadedState.windGustPercent;
                gustValue = loadedState.gustValue;
                diversionCount = loadedState.diversionCount;
                runwayDirection = loadedState.runwayDirection;
                rRunwayDirection = loadedState.rRunwayDirection;
                activeRunways = loadedState.activeRunways;
                activeRunwayThreshold = loadedState.activeRunwayThreshold;
                activeRunway = loadedState.activeRunway;
                arrivingRwy = loadedState.arrivingRwy;
                iaf = loadedState.iaf;
                faf = loadedState.faf;
                trafficType = loadedState.trafficType;
                depCooldown = loadedState.depCooldown;
                elapsedTime = loadedState.elapsedTime;
                planesHandled = loadedState.planesHandled;
                successfulDeps = loadedState.successfulDeps;
                successfulAriv = loadedState.successfulAriv;
                missedAproaches = loadedState.missedAproaches;
                lossOfSeparationSeconds = loadedState.lossOfSeparationSeconds;
                strayedAircraft = loadedState.strayedAircraft;
                emergenciesOn = loadedState.emergenciesOn;
                emergencyProbability = loadedState.emergencyProbability;
                emergencyCount = loadedState.emergencyCount;
                fuelEmergencyCount = loadedState.fuelEmergencyCount;
                area = loadedState.area;

                let obj = findInObjArr(theMaps, "area", area);
                let ind = theMaps.indexOf(obj);

                area = theMaps[ind].area;
                backgroundImage = theMaps[ind].backgroundImage;
                runways = theMaps[ind].runways;
                fixes = theMaps[ind].fixes;
                navpoints = theMaps[ind].navpoints;
                exitpoints = theMaps[ind].exitpoints;
                flights = theMaps[ind].flights;
                limits = theMaps[ind].limits;
                diversions = theMaps[ind].diversions;

                $(radarDiv).css("backgroundImage", "url(" + backgroundImage + ")");

                for (let i=0;i<currentAircraftArray.length;i++) {
                    let callsign = currentAircraftArray[i].callsign;
                    let type = currentAircraftArray[i].type;
                    let arrivingStatus = currentAircraftArray[i].arrivingStatus;
                    let destination = currentAircraftArray[i].destination;
                    let transitionAlt = currentAircraftArray[i].transitionAlt;

                    let d = document.createElement("div");
                    let p = document.createElement("p");
                    let sp1 = document.createElement("span");
                    sp1.innerHTML = callsign + " (" + type + ")<br>"
                    let sp2 = document.createElement("span");
                    if (arrivingStatus === false) {
                        sp2.innerHTML = destination + " " + transitionAlt + "<br>"
                        d.style.backgroundColor = "blue";
                    }
                    else {
                        d.style.backgroundColor = "saddlebrown";
                    }
                    let sp3 = document.createElement("span");
                    sp3.innerHTML = currentAircraftArray[i].commands.cmd_ias + " kn " + currentAircraftArray[i].commands.cmd_alt + " ft ";

                    d.style.cursor = "pointer";
                    d.appendChild(p);
                    p.appendChild(sp1);
                    p.appendChild(sp2);
                    p.appendChild(sp3);

                    document.getElementById("strips").appendChild(d);
                    $(d).click(function(){
                        $("#commandBox").val(callsign + " ");
                        $("#commandBox").focus();
                    });

                    currentAircraftArray[i].el = [sp1, sp2, sp3];
                }
                fromLoad = true;
                boot();

            })
        }
    });

    function readFile(file, callback){
        let reader = new FileReader();
        reader.onload = callback
        reader.readAsText(file);

    }
}
