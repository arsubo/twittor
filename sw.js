// imports
importScripts('js/sw-utils.js');


const STATIC_CACHE    = 'static-v5';
const DYNAMIC_CACHE   = 'dynamic-v3';
const INMUTABLE_CACHE = 'inmutable-v1';


const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];



self.addEventListener('install', e => {


    const cacheStatic = caches.open( STATIC_CACHE ).then(cache =>
        cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache =>
        cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );

});




self.addEventListener( 'fetch', e => {
    const request = e.request;

    // Verifica si es una petición a una URL externa con CORS
    if (request.url.startsWith('https://use.fontawesome.com') ||
        request.url.startsWith('https://fonts.googleapis.com')) {
        
        // Intenta hacer la petición con 'no-cors'
        const modifiedRequest = new Request(request, { mode: 'no-cors' });

        e.respondWith(
            fetch(modifiedRequest).catch(() => caches.match(request))
        );
        return;
    }

    const respuesta = caches.match(request).then(res => {
        if (res) {
            return res;
        } else {
            return fetch(request).then(newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, request, newRes);
            });
        }
    });

    e.respondWith(respuesta);
    });



    e.respondWith( respuesta );

});
