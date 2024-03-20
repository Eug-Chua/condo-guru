# CondoGuru

## Overview
The CondoGuru price explorer is an interactive web application designed to provide users with up-to-date information on condominium prices across Singapore.

Leveraging Leaflet for map rendering and integration with various APIs, the application presents an intuitive interface for exploring condo prices, median price data, and other relevant details such as MRT stations, bus stops, and shopping malls within the vicinity.

## Features
- **Interactive Map:** Utilizes Leaflet to render a dynamic map of Singapore, allowing users to easily navigate and zoom into areas of interest.
- **Condo Price Data:** Displays current and historical price data for condominiums, including transaction prices and price per square foot (PSF).
- **Location-Based Services:**
  - Taxi Availability: Shows real-time taxi availability within Singapore.
  - Public Transport Nodes: Marks MRT stations and bus stops on the map for convenient access to public transportation information.
  - Shopping Malls: Identifies shopping malls, enhancing the lifestyle aspect of condo living.
- **Data Layers:** Offers additional context with GeoJSON overlays representing various regions within Singapore.
- **Search Functionality:** Users can search for specific condos to view detailed price data and other relevant information.
- **Responsive Design:** Ensures a seamless experience across desktop and mobile devices.

## Technologies Used
- **Leaflet.js:** For rendering the interactive map and managing geographic data.
- **Axios:** For handling HTTP requests to external data sources and APIs.
- **ApexCharts:** For generating detailed and interactive charts displaying median condo price data over time.
- **HTML/CSS/JavaScript:** For structuring and styling the application's frontend.

## Data Sources
- **OpenStreetMap and Esri:** Base map layers providing detailed geographical context.
- **Data.gov.sg:** Real-time taxi availability data, condominium transaction prices, median price data, MRT stations, bus stops, and shopping mall locations, stored in JSON and CSV formats.

This project is deployed on Netlify: [https://verdant-licorice.netlify.app/](https://verdant-licorice-9c7427.netlify.app/)
