

function limpiarCache(cacheName,numeroItems){
    caches.open(cacheName)
    .then(cache =>{
        cache.keys()
        .then((keys=>{
            if(keys.length>numeroItems){
                cache.delete(keys[0])
                .then(limpiarCache(cacheName,numeroItems));
            }
        }))
    })
}


self.addEventListener('install',event=>{
    //abrir un cache para almacenar cosas ahí

    const cacheProm = caches.open('estatico-v2')
    .then(cache=>{
        return cache.addAll([
            '/',
            '/index.html',
            '/css/style.css',
            '/img/main.jpg',
            'js/app.js',
            '/img/no-img.jpg'
        ]);
    });

    const cacheInmutable = caches.open('inmutable-v1')
    .then(cache =>{
        return cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
    });
    event.waitUntil(Promise.all([cacheProm, cacheInmutable]));

}); 

self.addEventListener('fetch',event=>{
//5. Cache y network race
const respuesta = new Promise((resolve,reject)=>{
    let rechazada = false;
    const falloUnaVez=()=>{
        if(rechazada){
            if(/\.(png|jpg)$/i.test(event.request.url)){
                resolve(caches.match('/img/no-img.jpg'));
            }else{
                reject('No se encontró la respuesta');
            }

        }else{
            rechazada = true;
        }
    };

    fetch(event.request).then(resp=>{
        if(resp.ok){
            resolve(resp);
        }else{
            falloUnaVez();
        }
    }).catch(falloUnaVez);

    caches.match(event.request).then(resp=>{
        if(resp.ok){
            resolve(resp);
        }else{
            falloUnaVez();
        }
    }).catch(falloUnaVez);
});    
    event.respondWith(respuesta);



// //4. Cache with network update
// if(event.request.url.includes('bootstrap')){
//     return event.respondWith(caches.match(event.request));
// }

// const respuesta = caches.open('estatico-v2').then(cache=>{
//     fetch(event.request).then(newResp=>{
//         cache.put(event.request,newResp);
//     });
//     return cache.match(event.request);
// });
// event.respondWith(respuesta);

//     //3. Network with cache fallback
//     const respuesta = fetch(event.request).then(resp=>{
//         caches.open('dinamico-v1')
//         .then(cache=>{
//             cache.put(event.request,resp);
//             limpiarCache('dinamico-v1',50);
//         })
//         return resp.clone();
//     }).catch(err=>{
//     return caches.match(event.request);    
//     });
// event.respondWith(respuesta);

    // // // 2. Cache with network fallback
    // const respuesta = caches.match(event.request)
    // .then(resp=>{
    //     if(resp) return resp;

    //     //si no existe el recurso, tenemos que conectarnos a Internet
    //     console.log('No existe', event.request.url);
    //     return fetch(event.request).then(newResp=>{
    //         caches.open('dinamico-v1')
    //         .then(cache =>{
    //             cache.put(event.request,newResp);
    //             limpiarCache('dinamico-v1',4);
    //         });

    //         return newResp.clone();
    //     });
    // });
    // event.respondWith(respuesta);

    // 1. Cache-only
    //event.respondWith(caches.match(event.request));

});