//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhaWx1biIsImEiOiJjbTVvOTJvNzAwZnJrMmtwdGpkMzRvdmk1In0.TnWy4ZzmPCKAX1aYKDWMaQ'; 

const map = new mapboxgl.Map({
    container: 'map', // map container ID
    style: 'mapbox://styles/huailun/cm7mu0ad8019901qv61wbhg30', // style URL
    center: [-79.39, 43.73], // starting position [lng, lat], change this for centred map
    zoom: 10, // starting zoom level, adjust to a suitable size
});

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());


const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca" //Canada only
});

// Append geocoder variable to goeocoder HTML div to position on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({ center: [-79.39, 43.73], zoom: 10 });
});


// Bicycle parking 
map.on('load', () => {
    // Add Bicycle Parking Points Layer
    map.addSource('bicycle-parking', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/Bicycle-Parking.geojson' 
    });


    /////// Debug from chatgpt, but doesn't work: Print BICYCLE_CAPACITY values, can delete
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'bicycle-parking' && e.isSourceLoaded) {
            const features = map.querySourceFeatures('bicycle-parking');
            features.forEach(feature => {
                console.log('BICYCLE_CAPACITY:', feature.properties.BICYCLE_CAPACITY);
            });
        }
    });


    map.addLayer({
        'id': 'bicycle-parking',
        'type': 'circle',
        'source': 'bicycle-parking',
        'paint': {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 5, // Zoom level 10: 5px
                12,8  // Zoom level 12: 8px
            ],
            'circle-color': [
                'step', ['to-number', ['get', 'BICYCLE_CAPACITY']], /////add to-number is from chatgpt, but doesn't work
                '#d9f2d9', 9,
                '#a7e0a7', 19,
                '#76cd76', 29,
                '#44bb44', 99,
                '#0d880d'
            ],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 1
        }
    });

    // Cycling Network
    map.addSource('cycling-network', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/cycling-network.geojson'
    });

    map.addLayer({
        'id': 'cycling-network', // Unique ID for the layer
        'type': 'line', // Type of layer, line
        'source': 'cycling-network', // Source of the layer data
        'paint': {
            'line-color': '#d66705', // lines color
            'line-width': 2.2, //width of the lines
            'line-opacity': 0.91 //Opacity of the lines
        }
    });

    // Add Neighbourhoods
    map.addSource('neighbourhoods', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/Neighbourhoods.geojson' 
    });

    map.addLayer({
        'id': 'neighbourhoods',
        'type': 'fill',
        'source': 'neighbourhoods',
        'paint': {
            'fill-color': '#fce3c0',
            'fill-opacity': 0.64,
            'fill-outline-color': 'black'
        }
    });

    // Pop-up windows that appear on a mouse click or hover
    // pop up, Bicycle Parking. When mouse click, can see the bicycle parking info. Changing cursor on mouse over.
    map.on('mouseenter', 'bicycle-parking', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    // Changing cursor when mouse leave
    map.on('mouseleave', 'bicycle-parking', () => {
        map.getCanvas().style.cursor = '';
    });
    
    // Event listener for showing popup on click, here is points data bicycle parking
    map.on('click', 'bicycle-parking', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
            .setHTML(
                `<b>Bike Parking Capacity:</b> ${e.features[0].properties.BICYCLE_CAPACITY}<br>
                 <b>Address:</b> ${e.features[0].properties.ADDRESS_FULL}<br>
                 <b>Parking Type:</b> ${e.features[0].properties.PARKING_TYPE}<br>
                 <b>Neighbourhood:</b> ${e.features[0].properties.WARD}`
            )
            .addTo(map); //Show popup on map
    });

    // pop up, cycling network, mouse enter and mouse leave
    map.on('mouseenter', 'cycling-network', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'cycling-network', () => {
        map.getCanvas().style.cursor = '';
    });
    
    // Event listener for showing popup on click, here is line data cycling network
    map.on('click', 'cycling-network', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
                `<b>Street Name:</b> ${e.features[0].properties.STREET_NAME}<br>
                 <b>From Street:</b> ${e.features[0].properties.FROM_STREET}<br>
                 <b>To Street:</b> ${e.features[0].properties.TO_STREET}`
            )
            .addTo(map);
    });

    // create legend here
    //Define array variables for labels and colors.
    const legendLabels = [
        '0-9',
        '10-19',
        '20-29',
        '30-99',
        '>100'
        
    ];
    
    const legendColors = [
        '#d9f2d9',
        '#a7e0a7',
        '#76cd76',
        '#44bb44',
        '#0d880d'
    ];
    
    //Declare legend  here
    const legend = document.getElementById('legend');
    //Create a block for each layer to store the color and label
    legendLabels.forEach((label, i) => {
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = legendColors[i];

        const value = document.createElement('span');
        value.innerHTML = `${label}`;

        item.appendChild(key); //add the key (colour cirlce) to the legend row
        item.appendChild(value); //add the value to the legend row
        legend.appendChild(item); //add row to the legend
    });

    // Change display of legend based on check box
    let legendcheck = document.getElementById('legendcheck');

    legendcheck.addEventListener('click', () => {
        if (legendcheck.checked) {
            legendcheck.checked = true;
            legend.style.display = 'block';
        }
        else {
            legend.style.display = "none";
            legendcheck.checked = false;
        }
    });

    // Add event listener to toggle the visibility of the bicycle parking points layer
    document.getElementById('bicycleparkingcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'bicycle-parking',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    // event listener for cycling network layer
    document.getElementById('cyclingcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'cycling-network',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    // event listener for neighbourhood layer
    document.getElementById('neighbourhoodcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'neighbourhoods',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    //event listener for legend
    document.getElementById('legendcheck').addEventListener('change', (e) => {
        document.getElementById('legend').style.display = e.target.checked ? 'block' : 'none';
    });

});



