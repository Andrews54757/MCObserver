/*
Copyright 2020 Andrew S

Please see the LICENSES.md file in the source code for further information
*/


/*
Code flavour is Mojang Spaghetti

Explore at your own risk!
*/


// Proxy server since browser can't do raw TCP
var SERVER_URL = "https://minecraft-status-observer.herokuapp.com";

var SERVER_STATUS = "";

window.request = function ( /**/ ) {
    var url = arguments[0],
        post = undefined,
        callback,
        bust = false;

    if (arguments[2]) { // post
        post = arguments[1];
        callback = arguments[2];
        bust = arguments[3];
    } else {
        callback = arguments[1];
        bust = arguments[2];
    }
    try {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); // IE support
        xhr.open(post ? 'POST' : 'GET', url + (bust ? ("?" + Date.now()) : ""));
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    callback(undefined, xhr, xhr.responseText);
                } else {
                    callback(true, xhr, false);
                }

                var body = xhr.responseText;
                var res = xhr
            }
        };
        if (post) {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

            var toPost = [];
            for (var i in post) {
                toPost.push(encodeURIComponent(i) + '=' + encodeURIComponent(post[i]))
            }

            post = toPost.join("&")
        }

        xhr.send(post);
    } catch (e) {
        callback(e);
    }
}

var MEDIUM = "BROWSER"

if (navigator.standalone) {
    console.log('Launched: Installed (iOS)');
    MEDIUM = "IOS"
} else if (matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched: Installed');
    MEDIUM = "PWA"
} else {
    console.log('Launched: Browser Tab');
}



var deferredPrompt;
if (MEDIUM == "BROWSER") {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        showInstallPromotion();
    });
}


function showInstallPromotion() {

    document.getElementById("loadingchoicebox").style.display = "";
    document.getElementById("loadinginputbox").style.display = "none"


}

document.getElementById("appinstall").addEventListener("click", () => {
    deferredPrompt.prompt();

})
document.getElementById("browser").addEventListener("click", () => {

    document.getElementById("loadingchoicebox").style.display = "none";
    document.getElementById("loadinginputbox").style.display = "";

    if (config.servers.length != 0) {

        $("#loadingpage").fadeOut();
    }
})
/*
buttonInstall.addEventListener('click', (e) => {
    // Hide the app provided install promotion
    hideMyInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
    })
});

*/

window.addEventListener('appinstalled', (evt) => {
    console.log('app installed');
    document.getElementById("loadingchoicebox").style.display = "none";
    document.getElementById("loadinginputbox").style.display = "";
    if (config.servers.length != 0) {

        $("#loadingpage").fadeOut();
    }
});

if ('serviceWorker' in navigator) {
    try {
        navigator.serviceWorker.register('serviceWorker.js', {
            scope: "."
        }).then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful', registration);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
        console.log("Service Worker Registered");
    } catch (error) {
        console.log("Service Worker Registration Failed");
    }
}




function checkNotificationPermissions() {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        alert("We first need notification permissions to alert you when people join the servers your watching! Don't worry, it will only take one tick...");
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!", {
                    icon: "Observer300.png",
                    body: "Notifications permissions are all set!"
                });
            }
        });
    }
}


var config = {
    notificationsLevel: 2, // 0 - none, 1 - friends list only, 2 - all
    soundLevel: 2, // 0 - none, 1 - friends list only, 2 - all
    notifyLeave: true,
    servers: [],
    notifyList: []

}

var joinAudio = new Audio("ding.mp3");
var leaveAudio = new Audio("error.wav");

joinAudio.loop = false;
leaveAudio.loop = false;
var servers = [];
var serverListElement = document.getElementById("serverlist");

var pages = {
    servers: {
        page: document.getElementById("serverpage"),
        list: document.getElementById("listservers"),
        bottom: document.getElementById("bottommenuservers")
    },
    players: {
        page: document.getElementById("playerspage"),
        list: document.getElementById("listplayers"),
        bottom: document.getElementById("bottommenuplayers")
    },
    settings: {
        page: document.getElementById("settingspage"),
        list: document.getElementById("listsettings"),
        bottom: document.getElementById("bottommenusettings")
    }
}

$(".bottommenu .option, .pagelist .item").on('click', function () {
    var value = this.dataset.value;

    for (var page in pages) {



        pages[page].list.classList.remove("selected");
        pages[page].bottom.classList.remove("selected");

        pages[page].page.classList.remove("active");


        if (page === value) {
            pages[page].list.classList.add("selected");
            pages[page].bottom.classList.add("selected");
            pages[page].page.classList.add("active");
        }
    }


});

function updateConfig() {
    console.log("Written config to localStorage")
    localStorage.setItem("config", JSON.stringify(config));
}


function removeServer(server) {

    serverListElement.removeChild(server.elements.card)
    var ind = servers.indexOf(server);
    if (ind != -1) servers.splice(ind, 1);

    ind = config.servers.indexOf(server.config);
    if (ind != -1) config.servers.splice(ind, 1);
    updateConfig()

    if (servers.length === 0) {
        $("#loadingpage").fadeIn();
    }
}

function playJoinAudio() {
    if (joinAudio.paused) {
        joinAudio.play();
    }
}

function playLeaveAudio() {
    if (leaveAudio.paused) {
        leaveAudio.play();
    }
}


function addServer(name, address, port) {
    var server = {
        name: name || address,
        address: address,
        port: port,
        nlvl: 3, // 3 is default
        slvl: 3
    }
    config.servers.push(server);
    initializeServer(server)
    updateConfig();
}

//addServer("Owen's Server", "minecraftbasement.ddns.net", "25565")

function formatTime(d) {

    var seconds = d % 60;
    var minutes = Math.floor(d / 60);

    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;


    if (hours) {
        return hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;


    } else if (minutes) {
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    } else {
        return seconds + "s";
    }

}

function createServerElements(server) {
    var card = document.createElement("div");
    card.className = "servercard"

    var cardcontainer = document.createElement("div");
    cardcontainer.className = "container";
    card.appendChild(cardcontainer);

    var cardcontent = document.createElement("div");
    cardcontent.className = "cardcontent";
    cardcontainer.appendChild(cardcontent);


    var icon = document.createElement("img")
    icon.className = "icon";

    cardcontent.appendChild(icon)

    var nameinput = document.createElement("input");
    nameinput.placeholder = "Server Name";
    nameinput.className = "nameinput";
    cardcontent.appendChild(nameinput);


    var status = document.createElement("div");
    status.className = "status";

    var statusspan = document.createElement("span");
    status.appendChild(statusspan)

    var playerspan = document.createElement('span');
    status.appendChild(playerspan);

    cardcontent.appendChild(status)

    var chartcontainer = document.createElement("div");
    chartcontainer.className = "chart";



    var chartcanvas = document.createElement("canvas");

    cardcontent.appendChild(chartcontainer);
    chartcontainer.appendChild(chartcanvas)
    var lineData = [];
    var lineChart = new Chart(chartcanvas.getContext("2d"), {
        type: 'line',
        data: {
            datasets: [
                {
                    cubicInterpolationMode: "monotone",
                    label: "Players",
                    data: lineData
}
]
        },
        options: {
            legend: {
                display: false
            },
            responsive: true,
            scales: {
                xAxes: [{
                    display: false,

                    type: 'time'
            }],
                yAxes: [
                    {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            min: 0
                        }
                    }
                ]
            }
        }
    });


    var removeButton = document.createElement("i");
    removeButton.className = "removeBtn fa fa-times";
    cardcontent.appendChild(removeButton)
    removeButton.addEventListener("click", () => {
        removeServer(server)
    });

    nameinput.addEventListener("change", () => {
        var value = nameinput.value;

        if (value == "") {
            nameinput.value = server.config.name;
            return;
        }

        server.config.name = nameinput.value;

        updateConfig();

    });


    var cardSettings = document.createElement("div");

    cardSettings.className = "cardSettings";

    cardcontent.appendChild(cardSettings);


    var notificationSettings = document.createElement("div");

    notificationSettings.title = "Notification Settings"
    notificationSettings.className = "iconSetting";
    cardSettings.appendChild(notificationSettings)

    var notificationIcon = document.createElement("i");
    notificationIcon.className = "settingIcon fa fa-bell-o";
    notificationSettings.appendChild(notificationIcon)

    var notificationSelect = document.createElement("div");
    notificationSelect.className = "settingSelect";
    notificationSelect.textContent = server.config.nlvl == 3 ? "Default" : (server.config.nlvl == 2 ? "Always" : (server.config.nlvl == 1 ? "Friends" : "Never"));
    notificationSettings.appendChild(notificationSelect)

    notificationSettings.addEventListener("click", () => {
        var el = notificationSelect;
        var lvl = 0;
        if (el.textContent == "Default") {
            el.textContent = "Always"
            lvl = 2;
        } else if (el.textContent == "Always") {
            el.textContent = "Friends"
            lvl = 1;
        } else if (el.textContent == "Friends") {
            el.textContent = "Never";
            lvl = 0;
        } else {
            el.textContent = "Default";
            lvl = 3;
        }
        server.config.nlvl = lvl;
        updateConfig();
    })


    var audioSettings = document.createElement("div");
    audioSettings.title = "Sound Settings"
    audioSettings.className = "iconSetting";
    cardSettings.appendChild(audioSettings)

    var audioIcon = document.createElement("i");
    audioIcon.className = "settingIcon fa fa-music";
    audioSettings.appendChild(audioIcon)

    var audioSelect = document.createElement("div");
    audioSelect.className = "settingSelect";
    audioSelect.textContent = server.config.slvl == 3 ? "Default" : (server.config.slvl == 2 ? "Always" : (server.config.slvl == 1 ? "Friends" : "Never"));
    audioSettings.appendChild(audioSelect);


    audioSettings.addEventListener("click", () => {
        var el = audioSelect;
        var lvl = 0;
        if (el.textContent == "Default") {
            el.textContent = "Always"
            lvl = 2;
        } else if (el.textContent == "Always") {
            el.textContent = "Friends"
            lvl = 1;
        } else if (el.textContent == "Friends") {
            el.textContent = "Never";
            lvl = 0;
        } else {
            el.textContent = "Default";
            lvl = 3;
        }

        server.config.slvl = lvl;
        updateConfig();
    })



    var playerListContainer = document.createElement("div");
    playerListContainer.className = "playerListContainer";
    playerListContainer.style.display = "none"
    cardcontent.appendChild(playerListContainer);

    var playerText = document.createElement("div");
    playerText.style.fontSize = "20px"
    playerText.style.display = "none";
    playerText.textContent = "Players"

    playerListContainer.appendChild(playerText)

    var currentPlayers = document.createElement("div");
    playerListContainer.appendChild(currentPlayers)


    var pastText = document.createElement("div");
    pastText.style.fontSize = "20px"
    pastText.style.display = "none";
    pastText.textContent = "Past Players"

    playerListContainer.appendChild(pastText);


    var pastPlayers = document.createElement("div");
    playerListContainer.appendChild(pastPlayers)


    var showThingy = false;
    var mouseOverWindow = false;

    playerListContainer.addEventListener("mouseenter", () => {
        mouseOverWindow = true;
        playerListContainer.style.display = "";
    })

    playerListContainer.addEventListener("mouseleave", () => {
        mouseOverWindow = false;
        if (!showThingy) {
            playerListContainer.style.display = "none";
        }
    })

    status.addEventListener("mouseenter", () => {
        if (server.players.size || server.oldplayers.size)
            playerListContainer.style.display = "";




    })

    status.addEventListener("click", () => {
        if (playerListContainer.style.display == "none") {
            if (server.players.size || server.oldplayers.size) {
                playerListContainer.style.display = "";
                showThingy = true;
            }
        } else if (showThingy) {
            playerListContainer.style.display = "none";
            showThingy = false;
        } else {
            if (server.players.size || server.oldplayers.size) {

                showThingy = true;
            } else {
                playerListContainer.style.display = "none";
                showThingy = false;
            }
        }

    })
    status.addEventListener("mouseleave", () => {
        if (!showThingy) {
            if (!mouseOverWindow) playerListContainer.style.display = "none";
        }

    })

    return {
        card: card,
        icon: icon,
        nameinput: nameinput,
        status: status,
        statusspan: statusspan,
        playerspan: playerspan,
        chartcanvas: chartcanvas,
        lineChart: lineChart,
        lineData: lineData,
        playerListContainer: playerListContainer,
        playerText: playerText,
        currentPlayers: currentPlayers,
        pastText: pastText,
        pastPlayers: pastPlayers
    }


}

function initializeServer(config) {
    var server = {
        config: config,
        status: "N/A",
        version: "",
        online: 0,
        max: 0,
        icon: "",
        description: "",
        lastAttempt: 0,
        attempts: 0,
        lastOnline: 0,
        checks: 0,
        players: new Map(),
        oldplayers: new Map(),
        leavePlayers: []

    }
    server.elements = createServerElements(server)
    updateServer(server)
    serverListElement.appendChild(server.elements.card)
    servers.push(server)
}

function updateServer(server) {


    server.elements.nameinput.value = server.config.name;
    var newicon = server.icon || "./minecraft.png";
    if (newicon != server.elements.icon.src) server.elements.icon.src = newicon;
    server.elements.statusspan.textContent = server.status;
    if (server.status == "ONLINE") {

        server.players.forEach((player) => {
            player.elements.playtime.textContent = formatTime(Math.floor((Date.now() - player.joinedIn) / 1000))
        });


        server.oldplayers.forEach((player) => {
            player.elements.playtime.textContent = formatTime(Math.floor((player.leaveTime - player.joinedIn) / 1000)) + " " + moment(player.leaveTime).fromNow();

        })
        server.elements.statusspan.style.color = "rgb(0,100,0)";

        server.elements.playerspan.textContent = " - " + server.online + "/" + server.max + " Players"
        server.elements.lineData.push({
            x: Date.now(),
            y: parseInt(server.online)
        })


        var time = Date.now();
        for (var i = 0; i < server.elements.lineData.length - 2; i++) {
            if (time - server.elements.lineData[i].x > 1000 * 60 * 60 * 1) {
                server.elements.lineData.splice(i, 1);
                i--;
            } else
            if (i != 0 && server.elements.lineData[i].y == server.elements.lineData[i + 1].y && server.elements.lineData[i].y == server.elements.lineData[i - 1].y) {
                server.elements.lineData.splice(i, 1);
                i--;
            }
        }



        server.elements.lineChart.update()
    } else {
        server.elements.statusspan.style.color = "rgb(100,0,0)";
        server.elements.playerspan.textContent = "";
    }






}





function doAction(serverConfigValue, configValue, list, whitelist) {
    var value = serverConfigValue;
    if (value == 3) {
        value = configValue;
    }

    if (value == 0) {
        return false;
    } else if (value == 1) {
        if (!list) return false;
        return !list.every((player) => {
            return !whitelist.includes(player.name);
        })
    } else if (value == 2) {
        return true;
    }
}

function join(str, server, list) {
    if (document.getElementById("loadingpage").style.display != "none") return;

    if (doAction(server.config.slvl, config.soundLevel, list, config.notifyList)) playJoinAudio();
    if (doAction(server.config.nlvl, config.notificationsLevel, list, config.notifyList)) notify(`[${server.online}/${server.max}] ${str} joined ${server.config.name}`, server)
}



function leave(str, server, list) {
    if (document.getElementById("loadingpage").style.display != "none" || !config.notifyLeave) return;

    if (doAction(server.config.slvl, config.soundLevel, list, config.notifyList)) playLeaveAudio();
    if (doAction(server.config.nlvl, config.notificationsLevel, list, config.notifyList)) notify(`[${server.online}/${server.max}] ${str} left ${server.config.name}`, server)
}

function log(str, server) {
    console.log(new Date(), str, server)
}

function notify(str, server) {
    var notification = new Notification("MCObserver - " + server.config.name, {
        icon: server.icon || "Observer300.png",
        body: str,
        tag: "mc-observer-notify-" + server.config.name
    });
    setTimeout(() => {
        notification.close();
    }, 4000)

}

function createPlayerItem(playerObj) {
    var player = document.createElement("div");

    player.className = "playeritem";



    var picon = document.createElement("img");
    picon.src = "https://minotar.net/helm/" + playerObj.id.replace(/\-/g, "") + "/100.png";

    player.appendChild(picon)
    var username = document.createElement("div");
    username.className = "username";

    username.textContent = playerObj.name;
    username.title = playerObj.id;
    player.appendChild(username);


    var playtime = document.createElement("div");
    playtime.className = "playtime";

    player.appendChild(playtime);

    return {
        item: player,
        picon: picon,
        username: username,
        playtime: playtime

    }
}

function mainLoop() {
    // console.log("main")

    if (SERVER_STATUS != "online") {

        wakeBackend();
        return;
    }
    var toQuery = [];
    servers.forEach((server) => {
        if (server.status != "OFFLINE")
            toQuery.push(server);
        else
        if (server.attempts < 10) {

            if (Date.now() - server.lastAttempt >= server.attempts * 6 * 1000)
                toQuery.push(server);
        }
    })


    var query = toQuery.map((s) => {
        return {
            "address": s.config.address,
            "port": s.config.port
        }
    });

    if (query.length != 0) {
        console.log("Querying " + query.length + " servers")
        request(SERVER_URL + "/multiquery?query=" + encodeURIComponent(JSON.stringify(query)), (err, req, body) => {
            if (!err && body) {

                try {
                    var dt = JSON.parse(body);

                    toQuery.forEach((server, i) => {
                        var result = dt.result[i];
                        var data = result.data;
                        console.log(result)
                        if (result.error) {
                            server.lastAttempt = Date.now();
                            server.attempts++;
                            server.status = "OFFLINE";
                            updateServer(server)
                        } else {
                            server.attempts = 0;
                            server.status = "ONLINE"
                            server.version = data.version.name;
                            server.max = data.players.max;
                            server.online = data.players.online;
                            server.description = data.description;
                            server.latency = data.latency;
                            server.sample = data.players.sample;
                            server.icon = data.favicon;
                            server.description = data.description;
                            server.checks++;
                            var newPlayers = [];
                            var leavePlayers = server.leavePlayers;
                            if (data.players.sample && data.players.sample.length) {
                                data.players.sample.forEach((player) => {
                                    var foundPlayer = server.players.get(player.id)

                                    if (!foundPlayer) {

                                        var pl = server.oldplayers.get(player.id);
                                        if (pl) {
                                            player = pl;
                                            server.oldplayers.delete(player.id);
                                            server.elements.pastPlayers.removeChild(player.elements.item);

                                            if (server.oldplayers.size == 0) {
                                                server.elements.pastText.style.display = "none";
                                            }

                                        }
                                        player.foundIn = server.checks;

                                        server.players.set(player.id, player);
                                        var elements = createPlayerItem(player);
                                        player.elements = elements;
                                        player.joinedIn = Date.now();

                                        server.elements.currentPlayers.appendChild(player.elements.item);

                                        if (server.elements.playerText.style.display == "none") {
                                            server.elements.playerText.style.display = ""
                                        }
                                        newPlayers.push(player);
                                    } else {
                                        foundPlayer.foundIn = server.checks;
                                    }

                                })



                            }
                            server.players.forEach((player) => {
                                if (player.foundIn != server.checks) {
                                    leavePlayers.push(player);
                                    server.players.delete(player.id);
                                    server.oldplayers.set(player.id, player);
                                    player.leaveTime = Date.now();
                                    server.elements.currentPlayers.removeChild(player.elements.item);

                                    server.elements.pastPlayers.appendChild(player.elements.item);

                                    if (server.elements.pastText.style.display == "none") {
                                        server.elements.pastText.style.display = ""
                                    }

                                    if (server.players.size == 0) {
                                        server.elements.playerText.style.display = "none";
                                    }
                                }
                            })
                            if (newPlayers.length) {

                                join(newPlayers.map((p) => {
                                    log(p.name + " has joined " + server.config.name, server)
                                    return p.name;
                                }).join(", "), server, newPlayers);


                            } else {


                                if (leavePlayers.length) {
                                    leave(leavePlayers.map((p) => {
                                        log(p.name + " has left " + server.config.name, server, leavePlayers)
                                        return p.name
                                    }).join(", "), server)
                                } else if (server.online > server.lastOnline) {
                                    join((server.online - server.lastOnline === 1) ? "A player has" : ((server.online - server.lastOnline) + " players have"), server);

                                    log(server.config.name + " - " + server.online + "/" + server.max, server)
                                } else if (server.online < server.lastOnline) {
                                    leave((server.lastOnline - server.online === 1) ? "A player has" : ((server.lastOnline - server.online) + " players have"), server)

                                    log(server.config.name + " - " + server.online + "/" + server.max, server)

                                }

                                leavePlayers.length = 0;

                            }
                            server.lastOnline = server.online;



                            updateServer(server)
                        }

                    })

                } catch (e) {
                    console.log(e);
                }

                setTimeout(() => {
                    mainLoop();
                }, 5000)


            } else {
                console.log(err);
                SERVER_STATUS = "?";
                wakeBackend();



            }
        })
    } else {
        setTimeout(() => {
            mainLoop();
        }, 1000)
    }
}

function parseServerString(address) {
    var port = 25565;
    if (address.substring(0, 4) == "http") { // remove http/https
        var ind = address.indexOf("://");
        if (ind == 5 || ind == 4) {

            address = address.substring(ind + 3);
        }

    }

    var portInd = address.lastIndexOf(":");

    if (portInd !== -1) {

        var potentialPort = address.substring(portInd + 1);
        if (!isNaN(potentialPort)) {
            port = parseInt(potentialPort);
            address = address.substring(0, portInd);

        }
    }
    return {
        address: address,
        port: port
    }

}

document.getElementById("observebtn").addEventListener("click", () => {
    var input = document.getElementById("loadinginput");


    if (input.value == "") {
        return;
    }

    checkNotificationPermissions();



    $("#loadingpage").fadeOut();

    var dt = parseServerString(input.value)
    addServer("", dt.address, dt.port)
    input.value = "";
})

document.getElementById("topobservebtn").addEventListener("click", () => {
    var input = document.getElementById("topserverinput");


    if (input.value == "") {
        return;
    }


    var dt = parseServerString(input.value)
    addServer("", dt.address, dt.port)
    input.value = "";
})


function wakeBackend(attempt) {
    console.log("[BackendWaker] Getting backend status...")
    request(SERVER_URL + "/status", (err, req, body) => {

        if (!err && body) {
            var data = JSON.parse(body);
            SERVER_STATUS = data.status;
            if (SERVER_STATUS == "online") {
                console.log("[BackendWaker] Server is online. Startup at " + data.startup + ", online for " + data.online);
                mainLoop();
                return;
            }
        }

        console.log(err);
        if (attempt <= 0) {

            SERVER_STATUS = "unreachable";
        } else {
            console.log("[BackendWaker] Trying again in 5 sec... " + attempt + " attempts remaining")
            setTimeout(() => {

                wakeBackend(attempt - 1);
            }, 5000)
        }
    })

}
wakeBackend(10);


var configstr = localStorage.getItem("config");
if (configstr) {
    var newconfig = JSON.parse(configstr);

    for (var name in config) {

        if (newconfig.hasOwnProperty(name)) {
            config[name] = newconfig[name]
        }
    }

    if (config.servers.length != 0) {

        if (MEDIUM === "BROWSER") {

            setTimeout(() => {

                if (!deferredPrompt)
                    $("#loadingpage").fadeOut(500);
            }, 1000);
        } else {
            $("#loadingpage").fadeOut(500);
        }

    }
    config.servers.forEach((server) => {
        initializeServer(server);
    })

    console.log("Loaded " + config.servers.length + " servers from localStorage")
}

function setupSettings() {
    var box = document.getElementById("defaultBoxSettings");
    var notificationSettings = document.createElement("div");

    notificationSettings.className = "iconSetting";
    box.appendChild(notificationSettings)

    var notificationIcon = document.createElement("i");
    notificationIcon.className = "settingIcon fa fa-bell-o";
    notificationSettings.appendChild(notificationIcon)

    var notificationSelect = document.createElement("div");
    notificationSelect.className = "settingSelect";
    notificationSelect.textContent = (config.notificationsLevel == 2 ? "Always" : (config.notificationsLevel == 1 ? "Friends" : "Never"));
    notificationSettings.appendChild(notificationSelect)

    notificationSettings.addEventListener("click", () => {
        var el = notificationSelect;
        var lvl = 0;
        if (el.textContent == "Always") {
            el.textContent = "Friends"
            lvl = 1;
        } else if (el.textContent == "Friends") {
            el.textContent = "Never";
            lvl = 0;
        } else {
            el.textContent = "Always";
            lvl = 2;
        }
        config.notificationsLevel = lvl;
        updateConfig();
    })


    var audioSettings = document.createElement("div");
    audioSettings.className = "iconSetting";
    box.appendChild(audioSettings)

    var audioIcon = document.createElement("i");
    audioIcon.className = "settingIcon fa fa-music";
    audioSettings.appendChild(audioIcon)

    var audioSelect = document.createElement("div");
    audioSelect.className = "settingSelect";
    audioSelect.textContent = (config.soundLevel == 2 ? "Always" : (config.soundLevel == 1 ? "Friends" : "Never"));
    audioSettings.appendChild(audioSelect);


    audioSettings.addEventListener("click", () => {
        var el = audioSelect;
        var lvl = 0;
        if (el.textContent == "Always") {
            el.textContent = "Friends"
            lvl = 1;
        } else if (el.textContent == "Friends") {
            el.textContent = "Never";
            lvl = 0;
        } else {
            el.textContent = "Always";
            lvl = 2;
        }

        config.soundLevel = lvl;
        updateConfig();
    })


    doleavebox = document.getElementById("doleavebox");

    doleavebox.checked = config.notifyLeave;
    doleavebox.addEventListener("change", () => {
        config.notifyLeave = doleavebox.checked;
        updateConfig();
    })

    var input = document.getElementById("friendsinput")

    function updateInput() {

        config.notifyList.length = 0;

        function textNodesUnder(el) {
            var n, a = [],
                walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            while (n = walk.nextNode()) a.push(n);
            return a;
        }


        var nodes = textNodesUnder(input);





        for (var i = 0; i < nodes.length; i++) {

            var current = nodes[i];
            var img = null;
            var value = current.textContent.trim();

            if (value.length) {
                config.notifyList.push(value);
            }
            if (!current.nextSibling || current.nextSibling.nodeType !== 1 || current.nextSibling.nodeName !== "IMG") {


                if (value.length != 0) {
                    img = document.createElement("img");
                    img.style.height = "10px";
                    img.style.marginLeft = "5px";
                    img.style.userSelect = "none";
                    img.contentEditable = false;

                    current.after(img);
                }

            } else if (value.length != 0) {

                img = current.nextSibling;
            }

            if (img && img.dataset.value != value) {
                img.dataset.value = value;

                /*
                var results = [];
                for (var t in dict) {
                    var s = similarity(term, t);
                    if (s)
                        results.push([s, t, dict[t]]);
                }
                results.sort((a, b) => {
                    return b[0] - a[0];
                });

                
               
                
                
                if (results[0]) {
                    def.children[0].textContent = results[0][2]
                    renderDict(results);
                } else {
                    current.style.fontWeight = "normal"
                    renderDict(terms)
                }
                */
                img.src = "https://minotar.net/cube/" + encodeURIComponent(value) + "/100.png"
            }

        }

        var imgs = input.getElementsByTagName("img");

        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            if (!img.previousSibling) {

                img.style.opacity = 0;
            } else
            if (img.previousSibling.nodeType != 3 || img.previousSibling.textContent.trim().length == 0 || img.previousSibling.textContent.trim() != img.dataset.value) {
                img.parentElement.removeChild(img);
            } else {
                img.style.opacity = "";
            }
        }

    }
    input.addEventListener("keyup", (e) => {



        updateInput();
        updateConfig();

    });

    input.innerHTML = "";

    config.notifyList.forEach((player) => {
        var div = document.createElement("div");
        div.textContent = player;
        input.appendChild(div);
    })

    if (config.notifyList.length) updateInput();

}

setupSettings();
