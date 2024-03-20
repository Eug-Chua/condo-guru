document.addEventListener("DOMContentLoaded", async function() {
    // create map
    let singapore = [1.29, 103.85]; // Singapore's latlng
    let map = L.map("singaporeMap").setView(singapore, 12);

    // use layer from OneMap
    let openStreetLayer = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {maxZoom: 18, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    
    // use layer from Esri
    let esriLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {maxZoom: 18, attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);
    
    // add the maps to a layer for us to switch on and off
    let baseMaps = {
        "Map": openStreetLayer,
        "Satellite": esriLayer
    };

    let resultlayer = L.layerGroup()

    // load taxi coordinates
    const taxiPositions = await loadTaxi();
    
    // load condo data
    let priceData = await loadPriceData();

    // load median condo price data
    let medianPriceData = await loadMedianPriceData()

    // initiate empty cluster group for taxi coordinates
    const taxiCluster = L.markerClusterGroup();
    
    drawTaxi(taxiPositions, taxiCluster);
 
    // redraw taxi positions every 30 seconds
    setInterval(async function() {
        taxiCluster.clearLayers();
        const taxiPositions = await loadTaxi();
        drawTaxi(taxiPositions, taxiCluster);
    }, 300 * 1000)

    // initiate empty layer group for MRT station coordinates
    const mrtLayer = L.layerGroup();
    mrtLayer.addTo(map);

    fetchAndDrawMrt(mrtLayer);

    // initiate empty layer group for shopping mall coordinates
    const mallLayer = L.layerGroup();
    mallLayer.addTo(map);

    fetchAndDrawMalls(mallLayer);

    // initiate empty layer group for bus stop coordinates
    const busStopLayer = L.layerGroup();

    fetchAndDrawBusStop(busStopLayer);
    
    document.querySelector("#taxi-btn").addEventListener("click", function(){
        if (map.hasLayer(taxiCluster)) {
            map.removeLayer(taxiCluster)
        } else {
            map.addLayer(taxiCluster)
        }
    })

    document.querySelector("#mrt-btn").addEventListener("click", function(){
        if (map.hasLayer(mrtLayer)) {
            map.removeLayer(mrtLayer)
        } else {
            map.addLayer(mrtLayer)
        }
    })

    document.querySelector("#shopping-btn").addEventListener("click", function(){
        if (map.hasLayer(mallLayer)) {
            map.removeLayer(mallLayer)
        } else {
            map.addLayer(mallLayer)
        }
    })

    document.querySelector("#bus-btn").addEventListener("click", function(){
        if (map.hasLayer(busStopLayer)) {
            map.removeLayer(busStopLayer)
        } else {
            map.addLayer(busStopLayer)
        }
    })

    async function addGeoJsonLayer(url, color, weight, opacity) {
        const response = await axios.get(url);
        L.geoJSON(response.data, {
            style: function(feature) {
                return {color: color, weight: weight, opacity: opacity};
            }
        }).addTo(map);
    }
    
    // define layer groups for central region
    let centralAreaLayerGroup = L.layerGroup();
    let centralRegionLayerGroup = L.layerGroup();

    // add the layer groups to the map
    centralAreaLayerGroup.addTo(map);
    centralRegionLayerGroup.addTo(map);

    async function addGeoJsonLayer(url, color, weight, opacity, layerGroup) {
        const response = await fetch(url);
        const data = await response.json();
        const geoJsonLayer = L.geoJSON(data, {
            style: function(feature) {
                return {color: color, weight: weight, opacity: opacity};
            }
        });
        geoJsonLayer.addTo(layerGroup);
    }

    const coreCentralRegion = ["Bukit_Timah","Tanglin", "Downtown_Core", "Marina_East",
    'Marina_South', "Museum", "Newton", "Orchard", "Outram", "River_Valley",
    "Rochor", "Singapore_River", "Straits_View",'Southern_Islands'];

    for (let area of coreCentralRegion) {
        await addGeoJsonLayer(`./data/${area}.geojson`, "purple", 1, 1, centralAreaLayerGroup);
    }

    const restCentralRegion = ["Bishan", "Bukit_Merah", "Geylang", "Kallang", "Marine_Parade",
    "Novena", "Queenstown", "Toa_Payoh"];

    for (let area of restCentralRegion) {
        await addGeoJsonLayer(`./data/${area}.geojson`, "orange", 1, 1, centralRegionLayerGroup);
    }

    // add layer groups for toggling
    let overlayMaps = {
        "Core Central Region": centralAreaLayerGroup,
        "Rest of Central Region": centralRegionLayerGroup
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // add event listener for `enter` button
    document.querySelector("#searchTerms").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // prevent the default action to stop form submission
            document.querySelector("#searchBtn").click(); // click the search button
        }
    });
    
    // function to search condo location
    document.querySelector("#searchBtn").addEventListener("click", async function() {
        const keyword = document.querySelector("#searchTerms").value;
        const response = await SearchOneMap(keyword);
        const lat = response.results[0].LATITUDE;
        const lng = response.results[0].LONGITUDE;
        AddResultsToMap(response.results, resultlayer, priceData, medianPriceData);
        resultlayer.addTo(map);
        map.flyTo([lat, lng], 13)
    });
}
)

// create taxi icon 
let taxiIcon = L.icon({
 iconUrl: 'images/taxi.png',
 iconSize: [30, 30]
 });

 // create MRT icon 
let mrtIcon = L.icon({
    iconUrl: 'images/mrt-logo.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

 // create bus stop icon 
 let busStopIcon = L.icon({
    iconUrl: 'images/bus-stop-logo2.png',
    iconSize: [6, 6]
});

// create shopping mall icon 
let mallIcon = L.icon({
    iconUrl: './images/shopping-mall-logo.png', 
    iconSize: [25, 25],
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34] 
});


function drawTaxi(taxiPositions, taxiCluster) {
 // create one marker for each coordinate
 for (let taxi of taxiPositions) {
    // create coordinate for each taxi
    const coordinate = [taxi[1], taxi[0]];
    // create marker for each taxi - using icon
    const marker = L.marker(coordinate, {icon: taxiIcon}).addTo(taxiCluster);
    // add marker to the taxi cluster
    marker.addTo(taxiCluster)
 }
}

async function loadTaxi(){
    // load in coordinates of all available taxis from the API
    const response = await axios.get("https://api.data.gov.sg/v1/transport/taxi-availability");
    return response.data.features[0].geometry.coordinates;
}

async function loadShoppingMalls() {
    const response = await axios.get("shopping-malls.json")
    return response.data
}

async function loadMrt() {
    const response = await axios.get("mrt.json")
    return response.data
}

async function loadBusStops() {
    const response = await axios.get("bus-stops.json")
    return response.data
}

function addMrtMarkers(data, mrtLayer) {
    data.forEach(function(station) {
        let marker = L.marker([station.lat, station.long], {
            icon: mrtIcon,
            title: station.name
        }).bindPopup(`<strong>${station.name}</strong>`);
        marker.addTo(mrtLayer);

        // Use the 'popupopen' event to add specific class to the popup
        marker.on('popupopen', function(e) {
            // add the 'mrt-popup' class to the popup's root element
            e.popup.getElement().classList.add('mrt-popup');
        });
    });
}

function fetchAndDrawMrt(mrtLayer) {
    fetch('mrt.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            addMrtMarkers(data, mrtLayer);
        });
}

// Add bus stop markers to map
function addBusStopMarkers(data, bustStopLayer) {
    // convert object values to an array and iterate over it
    Object.values(data).forEach(function(busStop) {
        let marker = L.marker([busStop[1], busStop[0]], {
            icon: busStopIcon, 
            title: busStop[2]
        }).bindPopup(`<strong>${busStop[2]}</strong>`);
        marker.addTo(bustStopLayer);

        // Use the 'popupopen' event to add specific class to the popup
        marker.on('popupopen', function(e) {
            // add the 'mrt-popup' class to the popup's root element
            e.popup.getElement().classList.add('busStop-popup');
        });
    });
}

function fetchAndDrawBusStop(busStopLayer) {
    // get bus stop data
    fetch('bus-stops.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            addBusStopMarkers(data, busStopLayer);
        });
}

function addMallMarkers(data, mallLayer) {
    data.forEach(function(mall) {
        let marker = L.marker([mall.lat, mall.long], {
            icon: mallIcon,
            title: mall.name
        }).bindPopup(`<strong>${mall.name}</strong>`);
        // add marker to the mall layer
        marker.addTo(mallLayer);

        marker.on('popupopen', function(e) {
            // add the 'mrt-popup' class to the popup's root element
            e.popup.getElement().classList.add('shoppingMall-popup');
        });
    });
}


function fetchAndDrawMalls(mallLayer) {
    // get shopping mall data
    fetch('shopping-malls.json') 
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            addMallMarkers(data, mallLayer);
        });
}

// Add shopping mall markers to map
function addShoppingMallMarkers(data, mrtLayer) {
    data.forEach(function(station) {
        let marker = L.marker([station.lat, station.long], {
            icon: mrtIcon,
            title: station.name
        }).bindPopup(`<strong>${station.name}</strong>`);
        // add marker to the mrt cluster
        marker.addTo(mrtLayer);
    });
}

async function loadPriceData() {
    const pricedata = [];
    const response = await axios.get("condos_2023_2024.csv")
    const data = response.data.split("\n");
    for (const iterator of data) {
        const row = iterator.split(',');
        const info = {
            "name" : row[1],
            "transactedPrice" : row[2],
            "StreetName" : row[5],
            "psf" : row[4],
            "date": row[7]
        }
        pricedata.push(info);
    }
    return pricedata
}

async function loadMedianPriceData() {
    const medianpricedata = [];
    const response = await axios.get("median_condo_psf.csv")
    const data = response.data.split("\n");
    for (const iterator of data) {
        const row = iterator.split(',');
        const info = {
            "name" : row[0],
            "medianPSF2019" : parseFloat(row[1]),
            "medianPSF2020" : parseFloat(row[2]),
            "medianPSF2021" : parseFloat(row[3]),
            "medianPSF2022" : parseFloat(row[4]),
            "medianPSF2023" : parseFloat(row[5]),
            "medianPSF2024" : parseFloat(row[6]),
        }
        medianpricedata.push(info);
    }
    return medianpricedata
}

function AddResultsToMap(resultlist, resultlayer, condoPrice, medianCondoPrices) {
    resultlayer.clearLayers();
    const popupMaxWidth = 280; 
    
    let resultIcon = L.icon({
        iconUrl: 'images/condo-logo3.png',
        iconSize: [40, 50], 
        iconAnchor: [0, 0], 
        popupAnchor: [0, 0] 
    });

    const condoName = resultlist[0].SEARCHVAL;
    let price;
    let streetName;
    let psf;
    let date;
    let medianPSFData = [];
    for (let cp of condoPrice) {
        if (cp.name.includes(condoName)) {
            price = cp.transactedPrice;
            streetName = cp.StreetName;
            psf = cp.psf;
            date = cp.date;
            break;
        }
    }

    for (let medianprice of medianCondoPrices) {
        if (medianprice.name.includes(condoName)) {
            medianPSFData = [
                medianprice.medianPSF2019,
                medianprice.medianPSF2020,
                medianprice.medianPSF2021,
                medianprice.medianPSF2022,
                medianprice.medianPSF2023,
                medianprice.medianPSF2024
            ];
        }
    }
    
    // format currency output
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    });

    for (const r of resultlist) {
        const lat = r.LATITUDE;
        const lng = r.LONGITUDE;
        const marker = L.marker([lat, lng], { icon: resultIcon });
        marker.bindPopup(function () {
            const divElement = document.createElement('div');
            
            // Add textual information
            divElement.innerHTML = `
                <h5>${r.SEARCHVAL}</h5>
                <strong>${streetName}</strong>
                <p class='txnData'>Last Transacted Price: ${formatter.format(price)}</p>
                <p class='txnData'>Last Transacted $PSF: ${formatter.format(psf)}</p>
                <p class='txnData'>Last Transacted Date: ${date}</p>
            `;

            const chartContainer = document.createElement('div'); // Create a container for the ApexCharts chart
            chartContainer.style.width = `${popupMaxWidth}px`;
            chartContainer.style.height = "auto"; 
            chartContainer.id = `chart${r.UNIQUE_ID}`;
            divElement.appendChild(chartContainer); // append chart container

            // ApexCharts specifications
            setTimeout(() => {
                const options = {
                    series: [{
                        name: "Median $PSF",
                        data: medianPSFData
                    }],
                    legend: {
                        show: false,
                        floating:false,
                        onItemHover: {
                            highlightDataSeries: false
                        }
                    },            
                    chart: {
                        type: 'line',
                        height: 'auto',
                        width: '100%',
                        toolbar:{
                            show:false
                        },
                    },
                    colors:["#F0FFFF"],
                    xaxis: {
                        categories: ['2019', '2020', '2021', '2022', '2023', '2024']
                    },
                    dataLabels: {
                        style: {
                          colors: ['#000000']
                        }
                      },
                    title: {
                        text: 'Median $PSF FY19 to Present',
                        align: 'center'
                    },
                };

                const chart = new ApexCharts(document.querySelector(`#chart${r.UNIQUE_ID}`), options);
                chart.render();
            }, 10);

            return divElement;
        }, {maxWidth: "auto"}); // 

        marker.addTo(resultlayer);
    }
}
