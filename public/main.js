let map = L.map('main');
let bounds = [[1000,1000], [1000,1000]];
let image = L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);