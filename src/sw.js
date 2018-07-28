
import idb from 'idb';

var cache_version = 'restaurant-v1';

const dbPromise = idb.open('fm-udacity-restaurant', 1, upgradeDB => {
	switch (upgradeDB.oldVersion) {
		case 0: 
			upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
	}
});

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(cacheID).then(cache => {
			return cache
				.addAll([
					'/', 
					'/index.html', 
					'/restaurant.html',
					'/css/styles.css', 
					'/site/js/dbhelper.min.js', 
					'/img/na.png'
				])
				.catch(error => {
					console.log('Caches open failed: ' + error);
				});
		})
	);
});

self.addEventListener('fetch', event => {
	let cacheRequest = event.request; 
	let cacheUrlObj = new URL(event.request.url);

	if (event.request.url.indexOf('restaurant.html') > -1) {
		const cacheURL = 'restaurant.html'; 
		cacheRequest = new Request(cacheURL);
	}

	const checkURL = new URL(event.request.url);

	if (checkURL.port === '1337') {
		const parts = checkURL.pathname.split('/');
		const id =
			parts[parts.length - 1] === 'restaurants' ? '-1' : parts[parts.length - 1];
		handleNonAJAXEvent(event, cacheRequest);
	}
});

const handleAJAXEvent = (event, id) => {
	event.respondWith(
		dbPromise
			.then(db => {
				return db
					.transaction('restaurants')
					.objectStore('restaurants')
					.get(id);
			})
			.then(data => {
				return (
					(data && data.data) || 
					fetch(event.request)
						.then(fetchResponse => fetchResponse.json()) 
						.then(json => {
							return dbPromise.then(db => {
								const tx = db.transaction('restaurants', 'readwrite');
								tx.objectStore('restaurants').put({
									id: id, 
									data: json
								});
								return json;
							});
						})
				);
			})
			.then(finalResponse => {
				return new Response(JSON.stringify(finalResponse));
			})
			.catch(error => {
				return new Response('Error fetching data', { status: 500 });
			})
	);
};

const handleNonAJAXEvent = (event, cacheRequest => {
	event.respondWith(
		caches.match(cacheRequest).then(response => {
			return (
				response ||
				fetch(event.request) 
					.then(fetchResponse => {
						return caches.open(cacheID).then(cache => {
							cache.put(event.request, fetchResponse.clone());
							return fetchResponse;
						});
					})
					.catch(error => {
						if (event.request.url.indexOf('.jpg') > -1) {
							return caches.match('/img/na.png');
						}

						return new Response(
							'Application is not connected to the internet', 
							{
								status: 404, 
								statusText: 'Application is not connected to the internet'
							}
						);
					})
			);
		})
	);
});