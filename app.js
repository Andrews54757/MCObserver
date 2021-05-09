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
var version = "0.2.0";
document.getElementById("version").textContent = "v" + version
console.log('\n %c %c %cMC%cObserver %c-%c ' + version + ' %c By Andrews54757 \n', 'background: url(https://mcobserver.com/Observer192.png) no-repeat; background-size: 16px 16px; padding: 2px 6px; margin-right: 4px', 'background: rgb(50,50,50); padding:5px 0;', 'color: rgb(200,200,200); background: rgb(50,50,50); padding:5px 0;', 'color: rgb(200,200,200); background: rgb(50,50,50); padding:5px 0;', 'color: rgb(200,200,200); background: rgb(50,50,50); padding:5px 0;', 'color: #afbc2a; background: rgb(50,50,50); padding:5px 0;', 'color: black; background: #e9e9e9; padding:5px 0;')
console.log("Hello curious one! Welcome to MCObserver! Feel free to look around.")

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
       // alert("We first need notification permissions to alert you when people join the servers your watching! Don't worry, it will only take one tick...");
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
    notifyList: [],
    id: 1
}

class Stat {
    constructor(manager, name, value, icon, description, formatFunc) {
        this.manager = manager;
        this.name = name;
        this.value = value || 0;
        this.icon = icon;
        this.description = description;
        this.formatFunc = formatFunc;
        this.valueElement = null;
    }
    getValue() {
        return this.value;
    }
    getValueFormatted() {
        return this.formatFunc ? this.formatFunc(this.getValue()) : this.getValue().toString();
    }
    setValue(value) {
        this.value = value;
        this.onChanged();
    }
    increment() {
        this.value++;
        this.onChanged();
    }
    add(num) {
        this.value += num;
        this.onChanged();
    }
    onChanged() {
        if (this.valueElement) {
            this.valueElement.textContent = this.getValueFormatted();
        }
        this.flagManager();
    }
    flagManager() {
        this.manager.markForUpdate();
    }
    getName() {
        return this.name;
    }
    getIcon() {
        return this.icon;
    }
    getDescription() {
        return this.description;
    }
    setValueElement(el) {
        this.valueElement = el;
    }
}

var SpriteSheets = {
    items: {
        url: "https://mcobserver.com/Items.png?3",
        swidth: 32,
        sheight: 32
    },
    blocks: {
        url: "https://mcobserver.com/Blocks.png?3",
        swidth: 16,
        sheight: 16
    }
}
class SpriteIcon {
    constructor(SpriteSheet, x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.spriteSheet = SpriteSheet;
    }
    createElement(eWidth, eHeight) {
        var sheet = this.spriteSheet;
        var span = document.createElement("span");
        if (!sheet) return span;
        var xratio = eWidth / sheet.swidth;
        var yratio = eHeight / sheet.sheight;
        span.className = "spriteicon";
        span.style.backgroundImage = `url("${sheet.url}")`;
        span.style.backgroundPosition = `-${this.x * sheet.swidth}px -${this.y * sheet.sheight}px`;
        span.style.width = sheet.swidth + "px";
        span.style.transformOrigin = "0% 50%";
        span.style.height = sheet.sheight + "px";
        span.style.transform = `scale(${xratio}, ${yratio})`
        span.style.backgroundRepeat = "no-repeat";
        span.style.display = "block";
        return span;
    }
}

class StatisticsManager {
    constructor() {
        this.statistics = new Map();
        this.markedForUpdate = false;
    }
    create(name, value, icon, description, formatFunc) {
        var stat = new Stat(this, name, value, icon, description, formatFunc);
        this.statistics.set(name, stat);
        return stat;
    }
    get(name) {
        return this.statistics.get(name);
    }
    asObject() {
        var obj = {};
        this.statistics.forEach(function (stat) {
            obj[stat.getName()] = stat.getValue();
        });
        return obj;
    }
    saveStats() {
        localforage.setItem("stats", this.asObject()); 
    }
    loadStatsFromObject(obj) {
        this.statistics.forEach(function (stat) {
            if (obj.hasOwnProperty(stat.getName())) {
                stat.setValue(obj[stat.getName()]);
            }
        });
    }
    update() {
        if (this.markedForUpdate)
            this.saveStats();
    }
    markForUpdate() {
        this.markedForUpdate = true;
    }
    setupStatsPage() {
        var list = document.getElementById("statslist");
        list.innerHTML = "";

        this.statistics.forEach((stat)=>{
            var item = document.createElement("tr");
            item.className = "statsitem";

            var icon;
            if (stat.getIcon()) {
                icon = stat.getIcon().createElement(32, 32);
            } else {
                icon = document.createElement("span");
            }

            var iconContainer = document.createElement("td");
            iconContainer.classList = "statsicon"
            iconContainer.appendChild(icon);


            var name = document.createElement("td");
            name.className = "statsname tooltip";
            name.textContent = stat.getName();

            if (stat.getDescription()) {
                var tooltip = document.createElement("div");
                tooltip.className = "tooltiptext";
                tooltip.textContent = stat.getDescription();
                name.appendChild(tooltip);
            }
            


            var value = document.createElement("td");
            value.className = "statsvalue";

            value.textContent = stat.getValueFormatted();

            item.appendChild(iconContainer);
            item.appendChild(name);
            item.appendChild(value);
            stat.setValueElement(value);
            list.appendChild(item);

        });
    }
}


var statisticsManager = new StatisticsManager();
statisticsManager.create("Used Time", 0, new SpriteIcon(SpriteSheets.items, 30, 15), "", (val)=>{ return formatTime(Math.floor(val/1000))});
statisticsManager.create("Player Time", 0, new SpriteIcon(SpriteSheets.items, 15, 45), "", (val)=>{ return formatTime(Math.floor(val/1000))});
statisticsManager.create("Notifications Shown", 0, new SpriteIcon(SpriteSheets.items, 28, 105));
statisticsManager.create("Bells Rung", 0, new SpriteIcon(SpriteSheets.items, 8, 75));
statisticsManager.create("Blurps Played", 0, new SpriteIcon(SpriteSheets.items, 5, 12));
statisticsManager.create("Average Ping", 0, new SpriteIcon(SpriteSheets.items, 22, 113), "", (val)=> Math.floor(val*10)/10 + "ms");
statisticsManager.create("Players Joined", 0, new SpriteIcon(SpriteSheets.items, 1, 0));
statisticsManager.create("Players Left", 0, new SpriteIcon(SpriteSheets.items, 16, 29));
statisticsManager.create("Servers Added", 0, new SpriteIcon(SpriteSheets.items, 31, 15));
statisticsManager.create("Servers Removed", 0, new SpriteIcon(SpriteSheets.items, 10, 112));
statisticsManager.create("Servers Renamed", 0, new SpriteIcon(SpriteSheets.items, 9, 112));
statisticsManager.create("Servers Moved", 0, new SpriteIcon(SpriteSheets.items, 25, 111));
statisticsManager.create("Secret Found", false, new SpriteIcon(SpriteSheets.items, 21, 49), "Super secret", (val)=>val ? "Yes" : "No");


statisticsManager.setupStatsPage();

function secret() {
    statisticsManager.get("Secret Found").setValue(true);
    console.log("Secret Found")
}

var joinAudio = new Audio("ding.mp3");
var leaveAudio = new Audio("error.wav");

joinAudio.loop = false;
leaveAudio.loop = false;
var servers = [];
var serverListElement = document.getElementById("serverlist");
var sortableList = new Sortable(serverListElement, {
    animation: 150,
    ghostClass: 'reorder-highlight',
    dragClass: "sortable-drag",
    filter: ".removeBtn",
    onEnd: function(/**Event*/evt) {
		updateServerOrder(evt)
	}
});
var pages = {
    servers: {
        page: document.getElementById("serverpage"),
        list: document.getElementById("listservers"),
        bottom: document.getElementById("bottommenuservers")
    },
    stats: {
        page: document.getElementById("statspage"),
        list: document.getElementById("liststats"),
        bottom: document.getElementById("bottommenustats")
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

function saveConfig() {
    console.log("Written config to storage")
    localforage.setItem("config", config);
}


function updateServerOrder(evt) {
  //  console.log(evt);
   statisticsManager.get("Servers Moved").increment();
   var item = config.servers[evt.oldIndex];
   config.servers.splice(evt.oldIndex,1);
   config.servers.splice(evt.newIndex,0,item);

   saveConfig();
}
function removeServer(server) {

    statisticsManager.get("Servers Removed").increment();

    serverListElement.removeChild(server.elements.card)
    var ind = servers.indexOf(server);
    if (ind != -1) servers.splice(ind, 1);

    ind = config.servers.indexOf(server.config);
    if (ind != -1) config.servers.splice(ind, 1);
    saveConfig()

    if (servers.length === 0) {
        $("#loadingpage").fadeIn();
    }
}

function playJoinAudio() {
    if (joinAudio.paused) {
        statisticsManager.get("Bells Rung").increment();
        joinAudio.play();
    }
}

function playLeaveAudio() {
    if (leaveAudio.paused) {
        statisticsManager.get("Blurps Played").increment();
        leaveAudio.play();
    }
}


function addServer(name, address, port) {
    var server = {
        name: name || address,
        address: address,
        port: port,
        nlvl: 3, // 3 is default
        slvl: 3,
        id: config.id++
    }
    statisticsManager.get("Servers Added").increment();
    config.servers.push(server);
    initializeServer(server, true)
    saveConfig();
}

function formatTime(d) {

    var seconds = d % 60;
    var minutes = Math.floor(d / 60);

    var hours = Math.floor(minutes / 60);
    var days = Math.floor((hours / 24)*10)/10;
    if (days < 1) days = 0;
    hours = hours % 24;
    minutes = minutes % 60;

    var years = Math.floor(days / 365);
    days = days % 365;

    if (years) {
        return years + " year" + (years == 1 ? "" : "s") + " " + days + " day" + (days == 1 ? "" : "s");
    } else
    if (days) {
        return days + " day" + (days == 1 ? "" : "s");
    } else
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

    //card.dataset.serverid = server.config.id;

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

    var connectionspan = document.createElement("span");
    connectionspan.className = "pingbars tooltip";
    var connectiontooltip = document.createElement("div");
    connectiontooltip.className = "tooltiptext";
    
    var bars = [];
    for (var i = 0; i < 5; i++) {
        var pingbar = document.createElement("span");
        pingbar.className = "pingbar"
        connectionspan.appendChild(pingbar)
        bars.push(pingbar);
    }
    connectionspan.appendChild(connectiontooltip);
    status.appendChild(connectionspan);

    function updatePingStatus(ping) {
        var count = 0;
        if (ping < 0) {
            count = 0;
        } else if (ping < 150) {
            count = 5;
        } else if (ping < 300) {
            count = 4;
        } else if (ping < 600) {
            count = 3;
        } else if (ping < 1000) {
            count = 2;
        } else {
            count = 1;
        }

        if (ping < 0) {
            connectiontooltip.textContent = "Offline";
        } else {
            connectiontooltip.textContent = ping + "ms";
        }

        bars.forEach((bar, i)=>{
            if (i < count) {
                bar.classList.remove("disabled");
            } else
                bar.classList.add("disabled");

        })
    }

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
            layout: {
                padding: 5
            },
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

    nameinput.value = server.config.name;
    nameinput.addEventListener("change", () => {
        var value = nameinput.value;

        if (value == "") {
            nameinput.value = server.config.name;
            return;
        }

        server.config.name = nameinput.value;

        saveConfig();

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
        saveConfig();
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
        saveConfig();
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
        pastPlayers: pastPlayers,
        updatePingStatus: updatePingStatus
    }


}

function initializeServer(config, focusNameEdit) {
    var server = {
        config: config,
        status: "N/A",
        version: "",
        online: 0,
        max: 0,
        latency: 0,
        icon: "",
        description: "",
        lastAttempt: 0,
        attempts: 0,
        lastOnline: 0,
        checks: 0,
        isOverSampleLimit: false,
        players: new Map(),
        oldplayers: new Map(),
        playersSeen: new Map(),
        leavePlayers: []

    }
    server.elements = createServerElements(server)
    updateServer(server)
    serverListElement.appendChild(server.elements.card)
    servers.push(server)
    if (focusNameEdit) {
        server.elements.nameinput.focus();
    }
}

function updateServer(server) {


    //server.elements.nameinput.value = server.config.name;
    var newicon = server.icon || "./minecraft.png";
    if (newicon != server.elements.icon.src) server.elements.icon.src = newicon;
    server.elements.statusspan.textContent = server.status;
    if (server.status == "ONLINE") {
        server.elements.updatePingStatus(server.latency);
        server.players.forEach((player) => {
            player.elements.playtime.textContent = formatTime(Math.floor((Date.now() - player.joinedIn) / 1000))
        });


        server.oldplayers.forEach((player) => {
            player.elements.playtime.textContent = formatTime(Math.floor((player.leaveTime - player.joinedIn) / 1000)) + " " + moment(player.leaveTime).fromNow();

        })
        server.elements.statusspan.style.color = "rgb(0,100,0)";

        server.elements.playerspan.textContent = " - " + server.online + "/" + server.max + " Players"

        var online = server.online;
        if (server.elements.lineData.length > 2) {

            var moved = false;
            if (server.elements.lineData[server.elements.lineData.length - 1].y == server.elements.lineData[server.elements.lineData.length - 2].y && server.elements.lineData[server.elements.lineData.length - 2].y == server.elements.lineData[server.elements.lineData.length - 3].y) {
                server.elements.lineData[server.elements.lineData.length - 2].x = server.elements.lineData[server.elements.lineData.length - 1].x
                moved = true;

            }
            if (moved && server.elements.lineData[server.elements.lineData.length - 1].y == online) {
                server.elements.lineData[server.elements.lineData.length - 1].x = Date.now();

            } else {
                if (moved) {
                    server.elements.lineData[server.elements.lineData.length - 1].x = Date.now();
                    server.elements.lineData[server.elements.lineData.length - 1].y = online;
                } else {
                    server.elements.lineData.push({
                        x: Date.now(),
                        y: online
                    })
                }
            }

        } else {
            server.elements.lineData.push({
                x: Date.now(),
                y: online
            })
        }

        var time = Date.now();
        var last = null;
        var maxTime = 1000 * 60 * 60 * 1.5;
        for (var i = 0; i < server.elements.lineData.length - 2; i++) {
            if (time - server.elements.lineData[i].x > maxTime) {
                last = server.elements.lineData[i];
                server.elements.lineData.splice(i, 1);
                i--;
            } else {
                break;
            }
        }

        if (last) {
            last.x = time - maxTime;
            server.elements.lineData.splice(0, 0, last);
        }


        server.elements.lineChart.update()
    } else {
        server.elements.updatePingStatus(-1);
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
    statisticsManager.get("Notifications Shown").increment();
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

var lastTime = Date.now();
function mainLoop() {
    // console.log("main")
    var now = Date.now();

    var delta = now - lastTime;
    lastTime = now;
    statisticsManager.get("Used Time").add(delta);
    if (SERVER_STATUS != "online") {

        wakeBackend();
        return;
    }
    var toQuery = [];
    servers.forEach((server) => {
        if (server.status != "OFFLINE")
            toQuery.push(server);
        else
        {

            if (Date.now() - server.lastAttempt >= Math.min(server.attempts * 6 * 1000, 1000*60))
                toQuery.push(server);
        }
    })

    statisticsManager.update();
    
    var query = toQuery.map((s) => {
        return {
            "address": s.config.address,
            "port": s.config.port
        }
    });

    if (query.length != 0) {
       // console.log("Querying " + query.length + " servers")
        request(SERVER_URL + "/multiquery?query=" + encodeURIComponent(JSON.stringify(query)), (err, req, body) => {
            if (!err && body) {

                try {
                    var dt = JSON.parse(body);

                    var totalPing = 0;
                    var pingCount = 0;
                    toQuery.forEach((server, i) => {
                        var result = dt.result[i];
                        var data = result.data;
                        //console.log(result)
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
                            server.online = parseInt(data.players.online);
                            if (server.online) {
                                statisticsManager.get("Player Time").add(delta * server.online)
                            }
                            server.description = data.description;
                            server.latency = result.latency;
                            totalPing += server.latency;
                            pingCount++;
                            server.sample = data.players.sample;
                            server.icon = data.favicon;
                            server.description = data.description;
                            server.isOverSampleLimit = data.players.sample && data.players.sample.length < server.online;
                            server.checks++;
                            var newPlayers = [];
                            var leavePlayers = server.leavePlayers;
                            if (server.online != server.lastOnline) {
                                server.playersSeen.clear();
                            }
                            if (data.players.sample && data.players.sample.length) {
                                data.players.sample.forEach((player) => {
                                    var foundPlayer = server.players.get(player.id)
                                    server.playersSeen.set(player.id, player);
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
                                var hasSeenPlayer = player.foundIn == server.checks;
                                if (server.isOverSampleLimit) {
                                    hasSeenPlayer = true;
                                    if (server.playersSeen.size == server.online) {
                                        hasSeenPlayer = server.playersSeen.has(player.id);
                                    }
                                }
                                
                                if (!hasSeenPlayer) {
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
                            
                            if (server.playersSeen.size >= server.online)
                                server.playersSeen.clear();
                            
                            var shouldAnnouncePlayer = true; //!server.isOverSampleLimit || server.online != server.lastOnline;
                            if (shouldAnnouncePlayer && newPlayers.length) {

                                join(newPlayers.map((p) => {
                                    log(p.name + " has joined " + server.config.name, server)
                                    return p.name;
                                }).join(", "), server, newPlayers);


                            } else {
                                
                                if (shouldAnnouncePlayer && leavePlayers.length) {
                                    leave(leavePlayers.map((p) => {
                                        log(p.name + " has left " + server.config.name, server, leavePlayers)
                                        return p.name
                                    }).join(", "), server, leavePlayers)
                                } else if (server.online > server.lastOnline) {
                                    join((server.online - server.lastOnline === 1) ? "A player has" : ((server.online - server.lastOnline) + " players have"), server);

                                    log(server.config.name + " - " + server.online + "/" + server.max, server)
                                } else if (server.online < server.lastOnline) {
                                    leave((server.lastOnline - server.online === 1) ? "A player has" : ((server.lastOnline - server.online) + " players have"), server)

                                    log(server.config.name + " - " + server.online + "/" + server.max, server)

                                }

                                leavePlayers.length = 0;

                            }
                            var diff = server.online - server.lastOnline;
                            if (diff > 0) {
                                statisticsManager.get("Players Joined").add(diff);
                            } else if (diff < 0) {
                                statisticsManager.get("Players Left").add(-diff);
                            }
                            server.lastOnline = server.online;



                            updateServer(server)
                        }

                    })

                    if (pingCount) {
                        var averagePing = totalPing / pingCount;
                        var stat = statisticsManager.get("Average Ping");
                        stat.setValue(averagePing*0.1 + stat.getValue()*0.9);
                    }
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

async function init() {
var configstr = (await localforage.getItem("config"));
var newstats = await localforage.getItem("stats");
if (!configstr) {
    configstr = localStorage.getItem("config");
    if (configstr) {
        configstr = JSON.parse(configstr);
        localforage.setItem("config", configstr);
        console.log("Retrieved data from legacy storage")
    }
}

if (newstats) {
    statisticsManager.loadStatsFromObject(newstats);
}
if (configstr) {
    var newconfig = configstr;

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
      //  if (!server.id) server.id = config.id++;
        initializeServer(server);
    })

    console.log("Loaded " + config.servers.length + " servers from Storage")
}
}
init();

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
        saveConfig();
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
        saveConfig();
    })


    doleavebox = document.getElementById("doleavebox");

    doleavebox.checked = config.notifyLeave;
    doleavebox.addEventListener("change", () => {
        config.notifyLeave = doleavebox.checked;
        saveConfig();
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
        saveConfig();

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
