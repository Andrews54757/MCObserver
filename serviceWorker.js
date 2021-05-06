const staticAssets = [
    "./",
    "./Observer300.png",
    "./favicon.ico",
    "./fonts/minecraft.eot",
    "./fonts/minecraft.otf",
    "./fonts/minecraft.svg",
    "./fonts/minecraft.ttf",
    "./fonts/minecraft.woff",
    "./fonts/minecraft.woff2",
    "./AQuery.js",
    "./rose.png",
    "./witherrose.png",
    "./error.wav",
    "./ding.mp3",
    "./moment.js",
    "./minecraft.png",
    "./Chart.min.js",
    "./Sortable.js"
];


self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    async function cacheFirst(req) {
        const cache = await caches.open('dynamic-cache');

        const cachedResponse = caches.match(req);
        return cachedResponse || fetch(req);
    }


    async function networkFirst(req) {
        const cache = await caches.open('dynamic-cache');

        try {
            const res = await fetch(req);
            cache.put(req, res.clone());
            return res;
        } catch (error) {
            return await cache.match(req);
        }
    }

    if (url.origin === location.url) {
        event.respondWith(cacheFirst(req));
    } else {
        event.respondWith(networkFirst(req));
    }
});



self.addEventListener('install', async event => {
    console.log("installed")
    const cache = await caches.open('static-cache');
    cache.addAll(staticAssets);





});
