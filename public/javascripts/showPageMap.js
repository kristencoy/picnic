  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10", // style URL
    center: picnic.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
  });

  new mapboxgl.Marker()
    .setLngLat(picnic.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h4>${picnic.title}</h4>`
        )
    )
    .addTo(map);