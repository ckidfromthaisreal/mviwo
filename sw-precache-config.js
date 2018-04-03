/*
 * https://github.com/GoogleChromeLabs/sw-precache
 * service worker precache is a module for generating a service worker that precaches resources. 
 * it integrates with your build process. once configured, it detects all your static resourcse
 * (HTML, JS, CSS, images, etc.) and generates a hash of each file's contents.
 */

/* tells the sw-precache CLI how to generate our Service Worker */
module.exports = {
    /** tells the browser if the user requests a URL that cannot be found to fall back to
     the cached 'index.html' file and let the client side routing handle the page, a similar
     pattern most Angular devs are familiar with when using client-side routing.*/
    navigateFallback: '/index.html',
    /** tells sw-precache that the 'public' folder is the root of our web app and should not
     add dist to file paths */
    stripPrefix: 'public',
    /** tells sw-precache that 'public' is where the Service Worker should be created */
    root: 'public/',
    /** tells sw-precache which static files we would like the browser to cache and use */
    staticFileGlobs: [
        'public/index.html',
        'public/**.js',
        'public/**.css',
        'public/**.map',
        'public/**.eot',
        'public/**.svg',
        'public/**.woff2',
        'public/**.ttf',
        'public/**.woff',
        'public/assets/**.svg',
        'public/assets/**.png'
    ],
    /** maximum file size per static file. default: 2097152 (2.1MB~) */
    maximumFileSizeToCacheInBytes: 2097152
};