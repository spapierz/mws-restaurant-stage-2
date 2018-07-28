var serviceWorkerOption = {
  "assets": [
    "/dbhelper.min.js",
    "/main.min.js",
    "/restaurant.min.js"
  ]
};
        
        /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../sw.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../sw.js":
/*!****************!*\
  !*** ../sw.js ***!
  \****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var idb = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module 'idb'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var cache_version = 'restaurant-v1';

var dbPromise = idb.open('fm-udacity-restaurant', 1, function (upgradeDB) {
	switch (upgradeDB.oldVersion) {
		case 0:
			upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
	}
});

self.addEventListener('install', function (event) {
	event.waitUntil(caches.open(cacheID).then(function (cache) {
		return cache.addAll(['/', '/index.html', '/restaurant.html', '/css/styles.css', '/site/js/dbhelper.min.js', '/img/na.png']).catch(function (error) {
			console.log('Caches open failed: ' + error);
		});
	}));
});

self.addEventListener('fetch', function (event) {
	var cacheRequest = event.request;
	var cacheUrlObj = new URL(event.request.url);

	if (event.request.url.indexOf('restaurant.html') > -1) {
		var cacheURL = 'restaurant.html';
		cacheRequest = new Request(cacheURL);
	}

	var checkURL = new URL(event.request.url);

	if (checkURL.port === '1337') {
		var parts = checkURL.pathname.split('/');
		var id = parts[parts.length - 1] === 'restaurants' ? '-1' : parts[parts.length - 1];
		handleNonAJAXEvent(event, cacheRequest);
	}
});

var handleAJAXEvent = function handleAJAXEvent(event, id) {
	event.respondWith(dbPromise.then(function (db) {
		return db.transaction('restaurants').objectStore('restaurants').get(id);
	}).then(function (data) {
		return data && data.data || fetch(event.request).then(function (fetchResponse) {
			return fetchResponse.json();
		}).then(function (json) {
			return dbPromise.then(function (db) {
				var tx = db.transaction('restaurants', 'readwrite');
				tx.objectStore('restaurants').put({
					id: id,
					data: json
				});
				return json;
			});
		});
	}).then(function (finalResponse) {
		return new Response(JSON.stringify(finalResponse));
	}).catch(function (error) {
		return new Response('Error fetching data', { status: 500 });
	}));
};

var handleNonAJAXEvent = (event, function (cacheRequest) {
	event.respondWith(caches.match(cacheRequest).then(function (response) {
		return response || fetch(event.request).then(function (fetchResponse) {
			return caches.open(cacheID).then(function (cache) {
				cache.put(event.request, fetchResponse.clone());
				return fetchResponse;
			});
		}).catch(function (error) {
			if (event.request.url.indexOf('.jpg') > -1) {
				return caches.match('/img/na.png');
			}

			return new Response('Application is not connected to the internet', {
				status: 404,
				statusText: 'Application is not connected to the internet'
			});
		});
	}));
});

/***/ })

/******/ });
//# sourceMappingURL=sw.js.map