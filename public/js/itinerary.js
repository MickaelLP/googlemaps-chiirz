// Splide js

const splidesPics = document.querySelectorAll('#splidePics');
    splidesPics.forEach(splidePics => {
    new Splide(splidePics).mount();
});

new Splide('#carouselSteps', {
    drag: false,
}).mount();

let addToFavorites = document.querySelectorAll('#addToFavorites');
let isConnected = false
let itineraryId = HTMLElement;
let userId = HTMLElement;

if (document.querySelector('#dataset')) {
    itineraryId = document.querySelector('#dataset').dataset.itinerary;
    userId = document.querySelector('#dataset').dataset.user;
    isConnected = true;
};

let isClickable = true;

addToFavorites.forEach(fav => {
    fav.addEventListener('click', () => {
        if (!isClickable) {
            return;
        }
        isClickable = false;
        setTimeout(() => {
            isClickable = true;
        }, 1000);
        if (isConnected) {
            console.log('itineraryId', itineraryId);
            let favParent = fav.parentElement;
            let favoriteText = favParent.querySelector('div#addToFavorites');

            if (favParent.dataset.state === '1') {
                favParent.classList.add('fav--active');
                addToFavorite(itineraryId, userId);
                favParent.dataset.state = '0';
                favoriteText.innerHTML = 'Retirer des favoris';
            }
            else {
                favParent.classList.remove('fav--active');
                deleteFromFavorite(favParent.dataset.id);
                favParent.dataset.state = '1';
                favoriteText.innerHTML = 'Ajouter aux favoris';
            }
        }
        else {
            alert('Merci de vous connecter pour ajouter un itinéraire à vos favoris.')
        }
        
    });
});

function addToFavorite(itineraryId, userId) {
    let data = {
        'fk_itinerary': itineraryId,
        'fk_user': userId
    }

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        console.log(this.readyState);
        if (this.readyState == 4 && this.status == 200) {
            let likeId = this.responseText;
            document.querySelector('#favParent').dataset.id = likeId;
            // window.location.href = '/';
        }
        else {
            console.log('Status:', xhr.status, xhr.statusText);
            console.log('Response:', xhr.responseText);
        }
    };
    xhr.onerror = function() {
        console.log('error');
    }
    xhr.open("POST", "./add_fav/1", true);
    xhr.send(JSON.stringify(data));
};

function deleteFromFavorite(likeId) {

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const response = this.responseText;
            return response;
        }
        else {
            console.log('Status:', xhr.status, xhr.statusText);
            console.log('Response:', xhr.responseText);
        }
    };
    xhr.onerror = function() {
        console.log('error');
    }
    xhr.open("GET", "./delete_like/" + likeId, true);
    xhr.send();
};



function initMap() {

    getJsonBar();

    const itineraryMapDiv = document.querySelector('#itineraryMap');
    const service = new google.maps.places.PlacesService(itineraryMap);

    /*
    *
    *   Cette fonction permet de récuperer en ajax les bars d'un itinaires stocker dans un json.
    * 
    */ 
    async function getJsonBar() {
        const url = window.location.href;
        const urlSegments = url.split("/");
        const itineraryId = parseInt(urlSegments[urlSegments.length - 1]);
      
        const response = await fetch("./get_bar/" + itineraryId);
        const json = await response.json();
      
        console.log(json);
        console.log("--------\nJSON loaded\n--------");
      
        await informationItinerary(json[0]["bar"]);
        await afficheEtape(json);
        await calculateRouteLength(json[0]["bar"]);
    }

    function informationItinerary(jsonBar) {

        const Position = {
            paris : new google.maps.LatLng(48.8566, 2.3522),
            lyon : new google.maps.LatLng(45.7640, 4.8357),
            strasbourg : new google.maps.LatLng(48.5734, 7.7521),
        }

        // On relie les pos à leur identifier
        const jsonPos = {
            '1' : Position.paris,
            '2' : Position.lyon,
            '3' : Position.strasbourg
        }

        const itineraryMap = new google.maps.Map(itineraryMapDiv, {
            center: jsonPos[itineraryMapDiv.dataset.city],
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false
        });


        const directionService = new google.maps.DirectionsService();
        const directionsDisplay = new google.maps.DirectionsRenderer({
            map: itineraryMap
        });

        let waypoints = [];
        let start = new google.maps.LatLng(parseFloat(jsonBar['steps'][0]['lat']), parseFloat(jsonBar['steps'][0]['lng']));
        let end = new google.maps.LatLng(parseFloat(jsonBar['steps'][jsonBar['steps'].length -1]['lat']), parseFloat(jsonBar['steps'][jsonBar['steps'].length -1]['lng']));

        let waypointsName = [];
        let startName = jsonBar['steps'][0]['name'];
        let endName = jsonBar['steps'][jsonBar['steps'].length -1]['name'];

        for (let i = 1; i < jsonBar['steps'].length -2; i++) {

            let step = jsonBar['steps'][i];
            waypoints.push(
                { 
                    location :new google.maps.LatLng(parseFloat(jsonBar['steps'][i]['lat']), parseFloat(jsonBar['steps'][i]['lng'])),
                    stopover: true 
                }
            );

            waypointsName.push(step['name']);
                    
            let marker = new google.maps.Marker({
                position: jsonPos[step['city_id']],
                map: itineraryMap,
                title: step['name'],
                icon: {
                    url: "/img/beer.png"
                }
            });

            calculateAndDisplayRoute(directionService, directionsDisplay, start, waypoints, end, startName, waypointsName, endName);
        }

        function calculateAndDisplayRoute(directionsService, directionsDisplay, start, waypoints, end, starName, waypointsName, endName) {
            directionsService.route({
                origin: start,
                destination: end,
                waypoints: waypoints,
                avoidHighways: false,
                travelMode: google.maps.TravelMode.WALKING,
            }, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    var directions = directionsDisplay.getDirections();
                    var startDir = encodeURIComponent(starName);
                    let waypointsDir = encodeURIComponent(waypointsName.join("|"));
                    var endDir = encodeURIComponent(endName);
                    var travelMode = directions.request.travelMode.toLowerCase();
                    var link = 'https://www.google.com/maps/dir/?api=1&origin=' + startDir + '&destination=' + endDir + '&waypoints=' + waypointsDir + '&travelmode=' + travelMode;
                    document.querySelector('#linkGoogleMap').setAttribute('href', link);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    }


    async function afficheEtape(json) {

        const nbEtape = document.querySelectorAll(".stepIndex");
        const tel = document.querySelectorAll(".stepPhone");
        const noteMoyenne = document.querySelectorAll(".stepRateNumber");
        const nbNote = document.querySelectorAll(".stepOpinion");
        const isOpen = document.querySelectorAll(".stepIsOpen");
        const content = document.querySelectorAll(".divContent");
        const openGoogleMap = document.querySelectorAll(".stepName");


        for (let i = 0; i < nbEtape.length; i++) {
            const request_id = {
                placeId: json[0].bar.steps[i].place_id,
            } 

            const place = new Promise((resolve, reject) => {
                service.getDetails(request_id, function (place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(place);
                    } else {
                        reject(status);
                    }
                });
            });

            place.then(async (value) => {
                // Code à exécuter une fois value chargé
                
                if (value.international_phone_number) {
                    tel[i].href = "tel:"+value.international_phone_number;
                    tel[i].innerHTML = value.international_phone_number;
                }
                openGoogleMap[i].href = value.url;

                if (value.opening_hours) {
                    const today = new Date().getDay();
                    const todayHours = value.opening_hours.weekday_text[today];
                    const closingTime = todayHours.split(': ')[1];
                    const currentDate = new Date().toLocaleDateString();
                    const currentDay = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date().getDay()];
                    // const dateTimeString = `${currentDate}, ${currentDay} ${closingTime}`;
                    const dateTimeString = `${currentDay} ${closingTime}`;
                    let ouverture;
                    if (value.opening_hours.isOpen()) {
                        ouverture = "Ouvert";
                        isOpen[i].classList.add("parcours-info__p--ouvert");
                    } else {
                        ouverture = "Fermée";
                        isOpen[i].classList.add("parcours-info__p--fermee");
                    }
                    const openingHours = ouverture +' ● ' + dateTimeString;
                    isOpen[i].innerHTML = openingHours;
                }


                // Commentaires
                
                if (value.reviews) {
                    let section = document.createElement('section');
                    section.id = 'slide_comment';
                    section.className = 'splide';
                    section.setAttribute('aria-label', 'Slide sur les commentaires');
                
                    let div = document.createElement('div');
                    div.className = 'splide__track';
                
                    let ul = document.createElement('ul');
                    ul.className = 'splide__list';
                
                    value.reviews.forEach(function(review){
                        let li = document.createElement('li');
                        li.className = 'splide__slide';
                
                        let h4 = document.createElement('h4');
                        h4.textContent = review.author_name;
                
                        let p1 = document.createElement('p');
                        p1.textContent = review.text;
                
                        // let p2 = document.createElement('p');

                        let images =[];
                        for (let j=0; j<review.rating; j++) {
                            let img = document.createElement("img");
                            images.push(img);
                        }
                        console.log(images.length);

                        let div1 = document.createElement("div");
                        div1.classList.add("comment__stars");

                        images.forEach((img)=> {
                            img.src = starImage;
                            img.alt = "☆";
                            img.classList.add("comment__img");
                            div1.appendChild(img);
                            console.log(img.src);
                        });

                        li.appendChild(h4);
                        li.appendChild(p1);
                        li.appendChild(div1);
                        ul.appendChild(li);

                        // p2.textContent = 'Rating : ' + review.rating + '/5';
                
                        // li.appendChild(h4);
                        // li.appendChild(p1);
                        // li.appendChild(p2);
                        // ul.appendChild(li);
                    });
                
                    div.appendChild(ul);
                    section.appendChild(div);
                    content[i].appendChild(section);
                
                    document.querySelectorAll('#slide_comment').forEach(slide => {
                        new Splide(slide, {
                            type : "loop",
                            padding : "10rem",
                            pagination : false
                        }).mount();
                    });
                }

                if(value.rating) {
                    noteMoyenne[i].innerHTML = value.rating;
                }

                if(value.user_ratings_total){
                    nbNote[i].innerHTML = value.user_ratings_total;
                }
            });

        }
    }

    function calculateRouteLength(array) {
        const newDistance = document.querySelectorAll('.newDistance');

        // Au cas ou il n'y a qu'un bar
        if (array.steps.length == 1) return '0.00km';

        let origin = {placeId: array.steps[0].place_id};
        let destination = {placeId: array.steps[array.steps.length - 1].place_id};


        let waypoints = [];

        if (array.steps.length > 2) {
            for (let i = 1; i <= array.steps.length - 2; i++) {
                waypoints.push(
                    {
                        location: {lat: parseFloat(array.steps[i].lat), lng: parseFloat(array.steps[i].lng)},
                        stopover: true
                    }
                );
            }
        }

        var directionsService = new google.maps.DirectionsService();

        var request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: 'WALKING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };

        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                let route = response.routes[0];
                let lengthInMeters = 0;

                for (let i = 0; i < route.legs.length; i++) {
                    lengthInMeters += route.legs[i].distance.value;
                    numEtape =i+2;
                    
                    newDistance[i].innerHTML = route.legs[i].distance.text + '<span class="p p--16"> avant l\'étape '+numEtape+'</span>';
                }
                // let lengthInKm = lengthInMeters / 1000;

                // newDistance[0].innerHTML = parseFloat(lengthInKm.toFixed(1)) + ' km';
            }
        });
    }
    /*
    *
    *   Cette fonction permet de récuperer en ajax les bars d'un itinaires stocker dans un json.
    *   
    */ 
    

    
        
    // // position pour centrer la carte
    // const myLatlng = new google.maps.LatLng(48.816475, 7.786471);

    // // création d'une carte
    // const map = new google.maps.Map(document.getElementById('carte'), {
    // center: myLatlng,
    // zoom: 15
    // });

    // // lancement du service 'Places' pour les requêtes

    
    // function afficheEtapeDisynchrone(json){
    //     // Nombre d'étape
    //     const nbEtape = document.querySelectorAll("#stepIndex");
    //     // Récupération des balises numéro de téléphone
    //     const tel = document.querySelectorAll("#stepPhone");
    //     // Récupération des balises noteMoyenne
    //     const noteMoyenne = document.querySelectorAll("#stepRateNumber");
    //     // Récupération des balises pour le nombre total de rate.
    //     const nbNote = document.querySelectorAll("#stepOpinion");
    //     // Récupération des balises pour l'heure d'ouverture.
    //     const isOpen = document.querySelectorAll("#stepIsOpen");
    //     // Récupération de div du contenu 
    //     const content = document.querySelectorAll("#divContent");
    //     const openGoogleMap = document.querySelectorAll("#stepName");
    //     for (let i=0; i<nbEtape.length; i++){
    //         const request_id = {
    //             // Stocker dans la base de donnée le placeId. 
    //             placeId: json[0].bar.steps[i].place_id
    //         };

    //         // Récupère PlaceId. 
    //         // placeId: barJson['steps'][i + 1]['place_id']

    //         service.getDetails(request_id, function (place, status) {
    //             // pour comprendre ce qui est obtenu
    //             console.log("place : ");
    //             console.log(place);
            
    //             if (status == google.maps.places.PlacesServiceStatus.OK) {
    //                 // récupération d'un élément pour l'affichage
    //                 // const div = document.getElementById('info');
                
    //                 // génération de l'affichage
    //                 // Nom du lieu et son adresse :
    //                 // div.innerHTML += '<p><strong>' + place.name + '</strong></p>' +
    //                 // '<p>Adresse : ' + place.formatted_address + '</p>';
    //                 // div.innerHTML += '<p>Description du lieu :' + place.formatted_address + '</p>';

    //                 // Numéro de téléphone internationnal
    //                 tel[i].innerHTML += '<p>Numéro de téléphone :'+ place.international_phone_number +'</p>';

    //                 // Lien : voir sur google map
    //                 // div.innerHTML += '<a href="https://maps.google.com/?cid=5939382095293894464">Voir sur google map</a>';

    //                 // Commentaires
    //                 if (!(typeof place.reviews === 'undefined')) {
    //                     let s= "";
    //                     s +='<section id="slide_comment" class="splide" aria-label="Slide sur les commentaires">'+
    //                         '<div class="splide__track">' +
    //                                 '<ul class="splide__list">';
    //                     place.reviews.forEach(function(review){
    //                         s += '<li class="splide__slide">'
    //                         s += '<h4>'+review.author_name+'</h4>';
    //                         s += '<p>'+review.text+'</p>';
    //                         s += '<p>Rating : '+review.rating+'</p>';
    //                         s += '</li>';
    //                     });
    //                     s+= '</ul>' +
    //                         '</div>' +
    //                     '</section>';
    //                     content[i].innerHTML += s;
    //                     document.querySelectorAll('#slide_comment').forEach(slide => {
                            
    //                         new Splide(slide, {
    //                             type : "loop",
    //                             padding : "10rem",
    //                             pagination : false
    //                         }).mount();
    //                     });
    //                 }

    //                 console.log("Lien d'origine" + openGoogleMap[i].href);
    //                 openGoogleMap[i].href = place.url;
    //                 console.log("lien google map :" +openGoogleMap[i].href);
                    
    //                 // Gestion de l'heure : 
    //                 const today = new Date().getDay();
    //                 const openingHours = place.opening_hours;
    //                 // div.innerHTML += openingHours;
    //                 const todayHours = openingHours.weekday_text[today];
    //                 const closingTime = todayHours.split(': ')[1];

    //                 const currentDate = new Date().toLocaleDateString();
    //                 const currentDay = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][new Date().getDay()];
    //                 const dateTimeString = `${currentDate}, ${currentDay} ${closingTime}`;
    //                 const c = 'Heure d\'ouverture : '+ dateTimeString ;
    //                 isOpen[i].innerText = c;
    //                 console.log(isOpen[i].innerText);
                    
    //             }
    //         });
    //     }

    // }
    
    /*
    // ... requêtes et affichage ...

    // position autour de laquelle la recherche est effectuée
    var iut = new google.maps.LatLng(48.816475, 7.786471);
    
    // Requête par type de lieu (restaurant 2km autour de l'IUT)
    var request = {
        location: iut,
        radius: '2000',
        type: 'restaurant'
    };
    
    // Une autre requête
    var request = {
        location: iut,
        radius: '2000',
        type: 'restaurant',
        keyword: 'palais' // Permet de faire une recherche google maps sur le mot palais. 
    };

    // exécution de la requête
    
    service.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
        // récupération d'un élément pour générer l'affichage
        const div = document.getElementById('places');
    
        // boucle sur le tableau de lieux
        results.forEach(function (place) {
            // console.log("Near by Search");
            // console.log(place);
            
            // Récupère le nom du restaurant
            div.innerHTML += '<p>'+place.name+'</p>';

            // Price level 
            div.innerHTML += '<p>Price level : '+place.price_level+'</p>';

            // Note du restaurant.
            div.innerHTML += '<p>Note du restaurant :'+ place.rating +'</p>';
            
            let ouverture;
            if (place.opening_hours.open_now) {
              ouverture = "Ouvert";
            } else {
              ouverture = "Fermée";
            }

            // Ouverture du restaurant :
            div.innerHTML += '<p>' + ouverture +'</p>';

            // Place id 
            div.innerHTML += '<p>' + place.place_id +'</p>';

            // récupère la première photo du restaurant
            div.innerHTML += '<img height ="200" width="200" src="'+place.photos[0].getUrl()+'" alt="'+place.name+'">';
    
            // création d'un marqueur sur la carte
            var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
            });
        });
        }
    });
    */



    // Gestion des distances avec ou sans des étapes | waypoint
    // Doc sur l'api direction
    // https://developers.google.com/maps/documentation/javascript/directions?hl=fr

    // function WriteItineraryArguments(barJson) {
        
    //     // On initialise les fields qui vont contenir nos données
    //     let lenghtField = document.querySelectorAll('#parcoursLength')
    //     let phoneField = document.querySelectorAll('#stepPhone')

    //     let rateField = document.querySelectorAll('#stepRate')
    //     let opinionField = document.querySelectorAll('#stepOpinion')

    //     let priceField = document.querySelectorAll('#stepPrice')
    //     let openField = document.querySelectorAll('#stepIsOpen')

    //     for (let i = 0; i < barJson['steps'].length - 1; i++) {

    //         // Longueur du parcours
    //         let routeOrigin = {placeId: barJson['steps'][i]['place_id']};
    //         let routeDestination = {placeId: barJson['steps'][i + 1]['place_id']};
        
    //         const request = {
    //             origin: routeOrigin,
    //             destination: routeDestination,
    //             travelMode: 'WALKING',
    //             unitSystem: google.maps.UnitSystem.METRIC,
    //             avoidHighways: false,
    //             avoidTolls: false
    //         };
        
    //         service.route(request, function(result, status) {
    //             if (status == "OK") {
    //                 console.log(result)
    //                 lengthField[i].innerHTML = result.routes[0].legs[0].distance.text;
    //             }
    //             else {
    //                 distanceArray.push('ERROR');
    //             }
    //         }); 
    //     }
        
    //     // const dataCity = input.dataset.city;

    //     // let distanceArray = [];
        
    //     // let routeWaypoints = [];

        

    //     //     let distance
    //         // dataCity.push(distance)


    //         // if (i !== 0 || i !== array['steps'].length - 1) {
    //         //     // routeWaypoints.push({placeId: array['steps'][i]['place_id'], stopover: true})
    //         //     let placeId = array['steps'][i]['place_id'];

    //         //     // Utilisez l'API Google Places pour obtenir les coordonnées géographiques du lieu
    //         //     let placeService = new google.maps.places.PlacesService(map);
    //         //     placeService.getDetails({ placeId: placeId }, function (result, status) {
    //         //         if (status === google.maps.places.PlacesServiceStatus.OK) {
    //         //             let latlng = result.geometry.location;
    //         //             routeWaypoints.push({
    //         //                 location: latlng,
    //         //                 placeId: placeId,
    //         //                 stopover: true
    //         //     });
    //         //     }
    //         // });
    //         // }
            
    //     // }

    //     // input.forEach(function (elem, i) {
    //     //     elem.innerHTML+= 'Input' + i;
    //     // });
    // }

    // function calculerDistanceTotal(array) {
        

    //     // const dataCity = input.dataset.city;
        
    //     let routeWaypoints = [];

    //     for (let i = 0; i < array['steps'].length - 1; i++) {
    //         if (i !== 0 || i !== array['steps'].length - 1) {
    //             // routeWaypoints.push({placeId: array['steps'][i]['place_id'], stopover: true})
    //             let placeId = array['steps'][i]['place_id'];

    //             // Utilisez l'API Google Places pour obtenir les coordonnées géographiques du lieu
    //             let placeService = new google.maps.places.PlacesService(map);
    //             placeService.getDetails({ placeId: placeId }, function (result, status) {
    //                 if (status === google.maps.places.PlacesServiceStatus.OK) {
    //                     let latlng = result.geometry.location;
    //                     routeWaypoints.push({
    //                         location: latlng,
    //                         placeId: placeId,
    //                         stopover: true
    //                     });
    //                 }
    //             });
    //         }
    //     }

    //     console.log('waypoints', routeWaypoints);

    //     let routeOrigin = {placeId: array['steps'][0]['place_id']};
    //     let routeDestination = {placeId: array['steps'][array['steps'].length - 1]['place_id']};
    
    //     const request = {
    //         origin: routeOrigin,
    //         destination: routeDestination,
    //         waypoints: routeWaypoints,
    //         // waypoints: [waypoint1, waypoint2],
    //         travelMode: 'WALKING',
    //         unitSystem: google.maps.UnitSystem.METRIC,
    //         avoidHighways: false,
    //         avoidTolls: false
    //     };
    
    //     service.route(request, function(result, status) {
    //         if (status == "OK") {
    //             return result.routes[0].legs[0].distance.text;
    //         }
    //         else {
    //             throw new console.error('Impossible de recuperer la route');
    //         }
    //     });

    // }
    
    // const jsonModel = {
    //     "numberOfSteps" : 8,
    //     "steps" : [
    //         {
    //             "name" : "Brasserie du Haras",
    //             "place_id" : "ChIJMeZc_bLJlkcRmWB8Ns6akSo",
    //             "img" : [
    //                 "https://lh5.googleusercontent.com/p/AF1QipP3rZ7RtDKzASXQOCVFo5fFm9NE0nSGChkLZvsT=w426-h240-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPlPFQREbfq98X0-toVSQCO0QACHSRl5xBr86Pz=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipNlHDYIcKKWqVnH6PBA8mG_yhHn9S5qGfrRBTnC=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPVywS9k7-EDVefG4tOG-71P6HpHjqzldW41_ew=w408-h272-k-no"
    //             ]
    //         },
    //         {
    //             "name" : "Le Meteor",
    //             "place_id" : "ChIJu0dm8oHJlkcRqXTYHkfYgK0",
    //             "img" : [
    //                 "https://lh5.googleusercontent.com/p/AF1QipP3rZ7RtDKzASXQOCVFo5fFm9NE0nSGChkLZvsT=w426-h240-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPlPFQREbfq98X0-toVSQCO0QACHSRl5xBr86Pz=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipNlHDYIcKKWqVnH6PBA8mG_yhHn9S5qGfrRBTnC=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPVywS9k7-EDVefG4tOG-71P6HpHjqzldW41_ew=w408-h272-k-no"
    //             ]
    //         },
    //         {
    //             "name" : "Au Brasseur",
    //             "place_id" : "ChIJN7WSOFTIlkcRnF8aSbkqvH0",
    //             "img" : [
    //                 "https://lh5.googleusercontent.com/p/AF1QipP3rZ7RtDKzASXQOCVFo5fFm9NE0nSGChkLZvsT=w426-h240-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPlPFQREbfq98X0-toVSQCO0QACHSRl5xBr86Pz=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipNlHDYIcKKWqVnH6PBA8mG_yhHn9S5qGfrRBTnC=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPVywS9k7-EDVefG4tOG-71P6HpHjqzldW41_ew=w408-h272-k-no"
    //             ]
    //         },
    //         {
    //             "name" : "Au Cèdre",
    //             "place_id" : "ChIJObNrNFXIlkcRtqb7ocKZgj0",
    //             "img" : [
    //                 "https://lh5.googleusercontent.com/p/AF1QipP3rZ7RtDKzASXQOCVFo5fFm9NE0nSGChkLZvsT=w426-h240-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPlPFQREbfq98X0-toVSQCO0QACHSRl5xBr86Pz=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipNlHDYIcKKWqVnH6PBA8mG_yhHn9S5qGfrRBTnC=w408-h272-k-no",
    //                 "https://lh5.googleusercontent.com/p/AF1QipPVywS9k7-EDVefG4tOG-71P6HpHjqzldW41_ew=w408-h272-k-no"
    //             ]
    //         }
    //     ]
        
    // } 
    
    // WriteItineraryArguments(jsonModel, 'parcoursLength');


    // calculerDistance(jsonModel, 'le');
    
    // // Initialize the Places service
    // const services = new google.maps.places.PlacesService(map);

    // // Define the search parameters
    // const stras  = new google.maps.LatLng(48.578063, 7.741058);
    // const requestas = {
    //     query: 'Au Brasseur',
    //     location: stras,
    //     radius: 2000,
    // };

    // // Perform the search and retrieve the first result
    // console.log(services);

    // services.textSearch(requestas, function(results, status) {
    //     console.log(results);

    // if (status === google.maps.places.PlacesServiceStatus.OK) {
    //     const placeId = results[0].place_id;
    //     console.log(results)
    //     // Use the place_id in your code
    // }
    // });




    
}





  