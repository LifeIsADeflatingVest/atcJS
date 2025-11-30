# ATC JS

ATC JS, as its name implies, is a free air traffic control simulator made with JavaScript. You must direct landing and departing aircraft keeping them safely separated. 

![ATC JS image](img/screenshot1.webp)

## Features
- Selectable map (and easily customizable; see "Customizations", below).
- Save/load progress.
- Difficulty level influencing currently handled aircraft, wind (and possibly runway) change possibility, and rate of aircraft spawn.
- Select only departures, only arrivals, or both.
- Toggle emergencies & fuel emergencies on/off.
- Crosswind toggle on/off (affects go around possibility).
- Stats.

## Where to Play
ATC JS is entirely free to play on my website, [Home for Fiction](https://homeforfiction.com/apps/#atcJS) – instructions on how to play can be found on the simulator's screen. 
You can also read my [blog post](https://blog.homeforfiction.com/2025/11/30/free-air-traffic-control-simulator-javascript/) describing the inspiration and other details behind this ATC simulator.

## Customizations
I use two Greek airports for this simulation, the Athens International Airport (LGAV) and the Kalamata International Airport (LGKL), but it's very easy to make and use your own map, waypoints, and aircraft. Everything lives in the `data.js` file. Simply find the `theMaps` array of objects (line 20) and add another object there with your own airport data. You basically need a background image and to manually set the position of the runway(s), navaids, and other data. 

The easiest way would be to simply copy one of the existing array objects, replace the background image with your own, and then manually add the proper data based on what you see on the image – there are also more instructions inside `data.js`. I recommend using [Skyvector](https://skyvector.com/) for finding waypoint approximate positions.

## Support
ATC JS, like every other of [my programs](https://homeforfiction.com/apps) is entirely free. My motivation was simply to make something I liked; a week project, in a way. If you also liked this (either as a user or a developer) and you'd like to help me, you can buy me a coffee:

<a style="margin: 18px auto;width: fit-content" href="https://ko-fi.com/W7W55IO4D" target="_blank"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi6.png?v=6" border="0" alt="Buy Me a Coffee at ko-fi.com"></a><p style="font-size:0.9em;width:50%;margin:0 auto;text-align:justify;line-height: 1em;">(If you'd like to see what exactly you're supporting, read my <a href="https://homeforfiction.com/manifesto.php" target="_blank">creative manifesto</a>).</p>

## Licence
ATC JS is open-source under the AGPL-3.0 license. This is an open-source but somewhat restrictive license, see attached file for details. 
Note that ATC JS uses static map images from [OpenStreetMap](https://openstreetmap.org/copyright) that are not covered by the license described here.
