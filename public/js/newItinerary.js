// New itinaraary page


function initMap() {

    const jsonBar = {
        "numberOfSteps" : 0,
        "avgRate" : 0,
        "steps" : []
    } 

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

    let priceTotal = 0;
    let priceIndex = 0;

    let rateTotal = 0;
    let rateIndex = 0;

    const barNameInput = document.querySelector('#barNameInput');
    const citySelect = document.querySelector('#itinerary_fk_city');
    const barList = document.querySelector('#barList');
    barList.style.display = "none";
    const textInput = document.querySelector('#itinerary_text');
    const nameInput = document.querySelector('#itinerary_name');

    const linkToPosImg = document.querySelector('#linkToPosImg').dataset.link;
    const linkToPinImg = document.querySelector('#linkToPosImg').dataset.pin;
    const linkToCityImg = document.querySelector('#linkToPosImg').dataset.city;

    const map = new google.maps.Map(document.querySelector('#newMap'), {
        center: jsonPos[citySelect.value],
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
    });

    const directionService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
    });

    // lancement du service 'Places' pour les requêtes
    const service = new google.maps.places.PlacesService(map);
    let markers = [];
    let selectedMarkers = [];

    const sendBtn = document.querySelector('#sendBtn'); 
    sendBtn.addEventListener('click', function (e) {
        if (isFormValid()) {
            ajaxSendItinerary()
        }
        else {
            alert("Le formulaire n'est pas valide");
        }
    });

    barNameInput.addEventListener('input', function (e) {
        emptyMarkers();
        if (e.target.value === "") {
            barList.style.display = "none";
        }
        else {
            barList.style.display = "block";
            handleStateBtnSend();
            googleApiSearch(e.target.value, jsonPos[citySelect.value], barList);
        }
    });

    nameInput.addEventListener('input', function (e) {
        handleStateBtnSend();
    });

    citySelect.addEventListener('change', function (e) {
        emptyMarkers();
        if (barNameInput.value != "") {
            googleApiSearch(barNameInput.value, jsonPos[e.target.value], barList);
        }
        map.setCenter(jsonPos[e.target.value]);

        // On reset le json
        jsonBar.numberOfSteps = 0;
        jsonBar.steps = [];
        printSelectedBar();
    });

    // Active le bouton 'envoyer' si le formulaire est valide
    function handleStateBtnSend() {
        let btn = document.querySelector('#sendBtn');
        if (isFormValid()) {
            btn.classList.remove('btn--cant-send');
        }
        else {
            btn.classList.add('btn--cant-send');
        }
    };

    // Permet d'initialiser tout les boutons 'ajouter'
    function initAddButton() {
        let addBarBtn = document.querySelectorAll('#addBarBtn');

        addBarBtn.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                emptyMarkers();

                // On vide tout les champs
                barNameInput.value = "";
                barList.style.display = "none";
                barList.innerHTML = "";

                let placeId = e.target.parentElement.parentElement.dataset.placeid
                let imgArray = [];

                // On recupere les images
                const imagesRequest = {
                    placeId : placeId,
                    fields : ['photos']
                }

                service.getDetails(imagesRequest, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // On recupere les 10 premieres photos
                        const photos = place.photos;
                        for (let i = 0; i < 10; i++) {
                            try {
                                const photoUrl = photos[i].getUrl();
                                imgArray.push(photoUrl);
                            }
                            catch(e) {
                                if (i === 0) {
                                    imgArray.push(linkToCityImg);
                                }
                                console.log(i + " photo recupérées");
                            }
                        }
                    }
                });

                // On ajoute le bar à l'itinéraire
                jsonBar.numberOfSteps++;
                
                jsonBar.steps.push({
                    "name" : e.target.parentElement.parentElement.querySelector('.new__content__bar-input__prop__list__item__name').innerHTML,
                    "place_id" : placeId,
                    "lat" : e.target.parentElement.parentElement.dataset.lat,
                    "lng" : e.target.parentElement.parentElement.dataset.lng,
                    "price" : e.target.parentElement.parentElement.dataset.price,
                    "rate" : e.target.parentElement.parentElement.dataset.rate,
                    "img" : imgArray
                });

                var selectedMarker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(e.target.parentElement.parentElement.dataset.lat, e.target.parentElement.parentElement.dataset.lng),
                });

                selectedMarkers.push(selectedMarker);
            
                jsonBar['steps'].forEach(function (step) {
                    let rate = parseFloat(step.rate)
                    if (!isNaN(rate)) {
                        rateTotal += rate;
                        rateIndex++;
                    }
                });
                jsonBar.avgRate = parseFloat((rateTotal / rateIndex).toFixed(1));

                // On affiche les bars de l'itinéraire
                drawRoute();
                printSelectedBar();
                handleStateBtnSend();
            });
        });
    }

    function drawRoute() {
        if (jsonBar.steps.length > 2) {
            let start = new google.maps.LatLng(jsonBar.steps[0].lat, jsonBar.steps[0].lng);
            let end = new google.maps.LatLng(jsonBar.steps[jsonBar.steps.length - 1].lat, jsonBar.steps[jsonBar.steps.length - 1].lng);
            let waypoints = [];

            for (let i = 1; i < jsonBar.steps.length - 1; i++) {
                waypoints.push({
                    location: new google.maps.LatLng(jsonBar.steps[i].lat, jsonBar.steps[i].lng),
                    stopover: true
                });
            }

            directionService.route({
                    origin: start,
                    destination: end,
                    waypoints: waypoints,
                    avoidHighways: true,
                    travelMode: google.maps.TravelMode.WALKING,
                }, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
        }
        else {
            directionsDisplay.setDirections({routes: []});
        }
    }

    function printSelectedBar() {
        let barStepList = document.querySelector('#barStepList');
        barStepList.innerHTML = "";

        jsonBar.steps.forEach(function (bar, i) {
            barStepList.innerHTML += 
            `<li class="new__content__step__list__item" data-index="${i}">
                <div class="new__content__step__list__item__bar">
                    <div class="new__content__step__list__item__bar__step">Étape ${i + 1} : </div>
                    <div class="new__content__step__list__item__bar__name">${bar.name}</div>
                </div>
                <div class="new__content__step__list__item__btn">
                    <button class="btn btn--secondary" id="deleteBarBtn">Supprimer</button>
                </div>
            </li>`;
        });

        // On definit la distance du parcours
        calculateRouteLength(jsonBar);

        initDeleteBar();
    }

    function emptyMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    function initDeleteBar() {
        let deleteBarBtn = document.querySelectorAll('#deleteBarBtn');

        deleteBarBtn.forEach(function (btn) {
            btn.addEventListener('click', function (e) {

                // On supprime le bar de l'itinéraire
                let indexOfDelete = e.target.parentElement.parentElement.dataset.index;
                jsonBar.numberOfSteps--;
                jsonBar.steps.splice(indexOfDelete, 1);
                selectedMarkers[indexOfDelete].setMap(null);
                printSelectedBar();
                handleStateBtnSend();
                drawRoute();
            });
        });
    }

    function googleApiSearch(value, city, barList) {   

        let nameArray = [];
        let locationArray = [];
        let placeIdArray = [];
        let latArray = [];
        let lngArray = [];
        let priceArray = [];
        let rateArray = [];

        let googleSearchRequest = {
            location: city,
            query : value,
            radius: '4000',
            type: ['bar'],
            fields: ['name', 'place_id', 'formatted_address', 'geometry', 'price_level', 'rating', 'photos']
        };

        service.textSearch(googleSearchRequest, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
        
                // boucle sur le tableau de lieux
                results.forEach(function (place, i) {  
                    if (i < 5 ) {
                        // On stock ca dans les array et enfin on les affiche pour economiser des requetes
                        nameArray.push(place.name);
                        locationArray.push(place.vicinity);
                        placeIdArray.push(place.place_id);

                        latArray.push(place.geometry.location.lat());
                        lngArray.push(place.geometry.location.lng());
                        
                        priceArray.push(place.price_level);
                        rateArray.push(place.rating);
    
                        // création d'un marqueur sur la carte
                        var marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location,
                            icon: {
                                url: linkToPinImg,
                                scaledSize: new google.maps.Size(24, 24)
                            }
                        });
                        markers.push(marker);
                    }       
                });

                // On remplie nos listes
                nameArray = nameArray.slice(0, 5);
                locationArray = locationArray.slice(0, 5);
                placeIdArray.slice(0, 5);
                latArray.slice(0, 5);
                lngArray.slice(0, 5);
                priceArray.slice(0, 5);
                rateArray.slice(0, 5);

                // On vide la liste
                barList.innerHTML = "";

                // On ajoute les éléments
                nameArray.forEach(function (name, i) {
                    barList.innerHTML += "<li class='new__content__bar-input__prop__list__item' data-rate='" + rateArray[i] +  "' data-price='" + priceArray[i] + "' data-lat='" + latArray[i] +"' data-lng='" + lngArray[i] +"' data-placeid='" + placeIdArray[i] + "'><div class='new__content__bar-input__prop__list__item__name'>" + name + "</div><div class='new__content__bar-input__prop__list__item__address'><img src='" + linkToPosImg + "' alt=''><div class='new__content__bar-input__prop__list__item__address__add' id='addBarBtn'>+</div></li>";
                });

                // On ajoute la fonctionnalité 'ajouter' aux boutons
                initAddButton();
            }
        });
    }

    function calculateRouteLength(array) {
        const newDistance = document.querySelector('#newDistance');

        // Au cas ou il n'y a qu'un bar
        if (array.steps.length == 1) return '0.00km';

        let origin = {placeId: array.steps[0].place_id};
        let destination = {placeId: array.steps[array.steps.length - 1].place_id};
        
        let waypoints = [];

        if (array.steps.length > 2) {
            for (let i = 1; i <= array.steps.length - 1; i++) {
                waypoints.push(
                    {
                        location: {lat: parseFloat(array.steps[i].lat), lng: parseFloat(array.steps[i].lng)},
                        stopover: true
                    }
                );
            }
        }

        var directionService = new google.maps.DirectionsService();

        var request = {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            travelMode: 'WALKING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        };
        
        directionService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                let route = response.routes[0];
                let lengthInMeters = 0;

                for (let i = 0; i < route.legs.length; i++) {
                    lengthInMeters += route.legs[i].distance.value;
                }
                let lengthInKm = lengthInMeters / 1000;

                newDistance.innerHTML = parseFloat(lengthInKm.toFixed(1)) + ' km';
            }
        });
    }

    function isFormValid() {
        if (nameInput.value == '' || jsonBar.steps.length <= 2) {
            return false;
        }
        return true;
    }

    function ajaxSendItinerary() {

        let data = {
            'img': jsonBar['steps'][0].img[0],
            'text': textInput.value,
            'name': document.querySelector('#itinerary_name').value,
            'fk_city_id': citySelect.value,
            'distance': document.querySelector('#newDistance').innerHTML,
            'fk_user_id': document.querySelector('#linkToPosImg').dataset.user,
            'bar': jsonBar,
            'barDecode': JSON.stringify(jsonBar)
        }

        const url = window.location.href;
        const urlSegments = url.split("/");
        // ItineraryID -> Id de l'itinéraire. 
        const itineraryId = parseInt(urlSegments[urlSegments.length - 1]);
        

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const json = this.responseText;
                console.log(json);
                console.log('--------\nJSON loaded\n--------');
                window.location.href = '/';
            }
            else {
                console.log('Status:', xhr.status, xhr.statusText);
                console.log('Response:', xhr.responseText);
            }
        };
        xhr.onerror = function() {
            console.log('error');
        }
        xhr.open("POST", "./insert_bar/1", true);
        xhr.send(JSON.stringify(data));
    }
}