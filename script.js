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






map.on('load', () => {
    //add data source from GeoJSON data, this is about the cycling network data
    map.addSource('network-data', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab2/Data/cycling-network.geojson' 
     
    });

     // Add a layer to show the cycling network lines, matched with mapbox
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
    

    //add another data source from GeoJSON data, which is the bicycle parking racks 
    map.addSource('parking-data', {
        type: 'geojson',
        data: 'https://huailun-j.github.io/GGR472-Lab2/Data/Bicycle-Parking-Racks-Data.geojson' 

    });
    // Add a layer for bicycle parking rack, points, matched with mapbox
    map.addLayer({
        'id': 'parking-point', 
        'type':'circle', 
        'source': 'parking-data', 
        'paint': {
            'circle-color': '#f014ae', 
            'circle-opacity': 0.1, 
            'circle-radius': 10 // Radius of the circles
        }
        
    });

    
});
