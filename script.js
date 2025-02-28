//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhaWx1biIsImEiOiJjbTVvOTJvNzAwZnJrMmtwdGpkMzRvdmk1In0.TnWy4ZzmPCKAX1aYKDWMaQ'; 

const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/huailun/cm7mu0ad8019901qv61wbhg30', // style URL
    center: [-79.39, 43.73], // starting position [lng, lat], change this for centred map
    zoom: 10, // starting zoom level, adjust to a suitable size
});

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());

//Those from gpt
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

// Append geocoder variable to goeocoder HTML div to position on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({ center: [-79.39, 43.73], zoom: 10 });
});



// 这里开始是gpt
// Bicycle parking layer
map.on('load', () => {
    // Add Bicycle Parking Points Layer
    map.addSource('bicycle-parking', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/Bicycle-Parking.geojson' // Replace with actual path
    });

    map.addLayer({
        'id': 'parking-points',
        'type': 'circle',
        'source': 'bicycle-parking',
        'paint': {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 7, // Zoom level 10: 7px
                12, 5  // Zoom level 12: 5px
            ],
            'circle-color': [
                'step', ['get', 'BICYCLE_CAPACITY'],
                '#d9f2d9', // 0-30 (lightest green)
                60, '#a7e0a7',
                90, '#44bb44',
                120, '#0d880d',//>120 (darkest green)
            ],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 1
        }
    });

    // Cycling Network Layer
    map.addSource('cycling-network', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/cycling-network.geojson'
    });

    map.addLayer({
        'id': 'network-line', // Unique ID for the layer
        'type': 'line', // Type of layer, line
        'source': 'network-data', // Source of the layer data
        'paint': {
            'line-color': '#d66705', // lines color
            'line-width': 2.2, //width of the lines
            'line-opacity': 0.91 //Opacity of the lines
        }
    });

    // Add Neighbourhood Layer
    map.addSource('neighbourhoods', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/Neighbourhoods.geojson' 
    });

    map.addLayer({
        'id': 'neighbourhood-fill',
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
    map.on('mouseenter', 'bicycle-parking-points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    // Changing cursor when mouse leave
    map.on('mouseleave', 'bicycle-parking-points', () => {
        map.getCanvas().style.cursor = '';
    });


    map.on('click', 'bicycle-parking-points', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
                `<b>Bike Parking Capacity:</b> ${e.features[0].properties.BICYCLE_CAPACITY}<br>
                 <b>Address:</b> ${e.features[0].properties.ADDRESS_FULL}<br>
                 <b>Parking Type:</b> ${e.features[0].properties.PARKING_TYPE}<br>
                 <b>Neighbourhood:</b> ${e.features[0].properties.WARD}`
            )
            .addTo(map);
    });

    // pop up, cycling network, mouse enter and mouse leave
    map.on('mouseenter', 'cycling-neiwork', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'cycling-network', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', 'cycling-network', (e) => {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
                `<b>Street Name:</b> ${e.features[0].properties.STREET_NAME}<br>
                 <b>From Street:</b> ${e.features[0].properties.FROM_STREET}
                 <b>To Street:</b> ${e.features[0].properties.TO_STREET}`
            )
            .addTo(map);
    });

    // create legend here
    const legendlabels = [
        '0-30',
        '30-60',
        '60-90',
        '90-120',
        '>120'
        
    ];
    
    const legendcolours = [
        '#d9f2d9',
        '#a7e0a7',
        '#76cd76',
        '#44bb44',
        '#0d880d'
    ];
    
    //Declare legend  here
    const legend = document.getElementById('legend');
    //creating a block for each layer to put the colour and label in
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
            'parking-points',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    // event listener for cycling network layer
    document.getElementById('cyclingcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'cyclingnetwork',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    // event listener for neighbourhood layer
    document.getElementById('neighbourhoodcheck').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'neighbourhood-fill',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    //event listener for legend
    document.getElementById('legendcheck').addEventListener('change', (e) => {
        document.getElementById('legend').style.display = e.target.checked ? 'block' : 'none';
    });

});



