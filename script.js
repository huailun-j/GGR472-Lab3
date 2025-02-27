//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaHVhaWx1biIsImEiOiJjbTVvOTJvNzAwZnJrMmtwdGpkMzRvdmk1In0.TnWy4ZzmPCKAX1aYKDWMaQ'; 

const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/huailun/cm7mu0ad8019901qv61wbhg30', // style URL
    center: [-79.39, 43.73], // starting position [lng, lat], change this for centred map
    zoom: 10, // starting zoom level, adjust to a suitable size
});

//Those from gpt
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

// Append geocoder variable to goeocoder HTML div to position on page
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({ center: [-79.39, 43.73], zoom: 10 });
});

// add zoom control
map.addControl(new mapboxgl.NavigationControl());

// Add fullscreen option to the map
map.addControl(new mapboxgl.FullscreenControl());


// 这里开始是gpt
// Bicycle parking layer
map.on('load', () => {
    // Add Bike Parking Points Layer
    map.addSource('bike-parking', {
        type: 'geojson',
        data: 'your-bike-parking-data.geojson' // Replace with actual path
    });

    map.addLayer({
        'id': 'parking-points',
        'type': 'circle',
        'source': 'bike-parking',
        'paint': {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 7, // Zoom level 10: 7px
                12, 5  // Zoom level 12: 5px
            ],
            'circle-color': [
                'step', ['get', 'BICYCLE_CAPACITY'],
                '#d9f2d9', // 0-20 (lightest green)
                20, '#a7e0a7',
                50, '#76cd76',
                80, '#44bb44',
                100, '#1faa1f',
                120, '#0d880d' // >120 (darkest green)
            ],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 1
        }
    });

    // Cycling Network Layer
    map.addSource('cycling-network', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab3/Data/Bicycle-Parking.geojson'
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
        data: 'your-neighbourhoods-data.geojson' // Replace with actual path
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





