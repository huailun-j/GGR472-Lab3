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
    // here 2 "if" founction I asked chatgpt to help, there are orange points and blue points overlay in my webmap, I think those 2 layers are duplicate. And I try to delete orange point layer.
    // Remove any old orange points layer if it exists
    if (map.getLayer('bicycle-parking')) {
        map.removeLayer('bicycle-parking');
    }

    // Remove the old source (GeoJSON data) if it exists, I think it causes duplicate layers or conflicts
    if (map.getSource('bicycle-parking')) {
        map.removeSource('bicycle-parking');
    }

    // Add Bicycle Parking Points Layer
    map.addSource('bicycle-parking', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/huailun-j/GGR472-Lab3/main/Data/Bicycle-Parking.geojson' 
    });

    map.addLayer({
        'id': 'bicycle-parking-pnt',//change the unique id
        'type': 'circle',
        'source': 'bicycle-parking',
        'layout': {
            'visibility': 'visible'  
        },
        'paint': {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 7.2, // Zoom level 10: 8px
                12, 6 // Zoom level 12:6px
            ],
            'circle-color': [
                'step', 
                ['get', 'BICYCLE_CAPACITY'], 
                '#b3cde3', //0-9
                9, '#6497b1', //10-19
                19, '#005b96', // Darker Blue (20-29)
                29, '#024D82', // Deep Blue (30-99)
                99, '#011f4b'  // Almost Black (100+)

            ],
 
        }
    });

    // Cycling Network
    map.addSource('cycling-network', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/huailun-j/GGR472-Lab3/main/Data/cycling-network.geojson'
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
        data: 'https://raw.githubusercontent.com/huailun-j/GGR472-Lab3/main/Data/Neighbourhoods.geojson' 
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
    map.on('mouseenter', 'bicycle-parking-pnt', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    // Changing cursor when mouse leave
    map.on('mouseleave', 'bicycle-parking-pnt', () => {
        map.getCanvas().style.cursor = '';
    });
    
    // Event listener for showing popup on click, here is points data bicycle parking
    map.on('click', 'bicycle-parking-pnt', (e) => {
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
    //legend color
    const legendColors = [
        '#b3cde3',
        '#6497b1',
        '#005b96',
        '#024D82',
        '#011f4b'
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
            'bicycle-parking-pnt',
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





