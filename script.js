let map;
let service;

// Inicializar o mapa
function initMap() {
    const initialLocation = { lat: -14.235, lng: -51.9253 }; // Centro do Brasil
    map = new google.maps.Map(document.getElementById("map"), {
      center: initialLocation,
      zoom: 14,
      styles: [
        {
          elementType: "geometry",
          stylers: [{ color: "#1d2c4d" }],
        },
        {
          elementType: "labels.text.fill",
          stylers: [{ color: "#8ec3b9" }],
        },
        {
          elementType: "labels.text.stroke",
          stylers: [{ color: "#1a3646" }],
        },
        {
          featureType: "administrative.country",
          elementType: "geometry.stroke",
          stylers: [{ color: "#4b6878" }],
        },
        {
          featureType: "landscape.man_made",
          elementType: "geometry.stroke",
          stylers: [{ color: "#334e87" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#283d6a" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6f9ba5" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#304a7d" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#98a5be" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0e1626" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#4e6d70" }],
        },
      ],
    });
  }
  

// Obter localização do usuário
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocalização não é suportada pelo seu navegador."));
    }
  });
}

// Exibir detalhes do restaurante
function displayRestaurantDetails(restaurant) {
  const name = restaurant.name;
  const address = restaurant.vicinity || "Endereço não disponível";
  const rating = restaurant.rating || "Sem avaliações";
  const userRatingsTotal = restaurant.user_ratings_total || "Nenhuma avaliação";
  const isOpen = restaurant.business_status === "OPERATIONAL" ? "Aberto" : "Fechado Temporariamente";
  const priceLevel = restaurant.price_level ? "R$".repeat(restaurant.price_level) : "N/A";

  document.getElementById("restaurant-info").innerHTML = `
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>Endereço:</strong> ${address}</p>
    <p><strong>Avaliação:</strong> ${rating} (${userRatingsTotal} avaliações)</p>
    <p><strong>Status:</strong> ${isOpen}</p>
    <p><strong>Faixa de Preço:</strong> ${priceLevel}</p>
  `;
}

// Encontrar restaurantes
function findRestaurants(location, cuisine, radius) {
  const request = {
    location: new google.maps.LatLng(location.lat, location.lng),
    radius: radius * 1000, // Converte para metros
    type: "restaurant",
    keyword: cuisine,
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      // Filtrar restaurantes abertos
      const openRestaurants = results.filter(
        (restaurant) => restaurant.business_status === "OPERATIONAL"
      );

      if (openRestaurants.length > 0) {
        // Escolher um restaurante aleatório
        const randomIndex = Math.floor(Math.random() * openRestaurants.length);
        const chosenRestaurant = openRestaurants[randomIndex];

        // Exibir detalhes e atualizar mapa
        displayRestaurantDetails(chosenRestaurant);

        const restaurantLocation = chosenRestaurant.geometry.location;
        map.setCenter(restaurantLocation);

        new google.maps.Marker({
          position: restaurantLocation,
          map: map,
          title: chosenRestaurant.name,
        });
      } else {
        document.getElementById("restaurant-info").innerHTML =
          "Nenhum restaurante aberto foi encontrado.";
      }
    } else {
      document.getElementById("restaurant-info").innerHTML =
        "Nenhum restaurante encontrado no raio selecionado.";
    }
  });
}

// Função principal
document.getElementById("find-btn").addEventListener("click", async () => {
  const cuisine = document.getElementById("cuisine").value;
  const radius = parseInt(document.getElementById("radius").value, 10);

  try {
    // Obter localização do usuário
    const location = await getUserLocation();

    // Inicializar o mapa
    initMap(location.lat, location.lng);

    // Buscar restaurantes
    findRestaurants(location, cuisine, radius);
  } catch (error) {
    document.getElementById("restaurant-info").innerHTML =
      "Erro: Não foi possível acessar sua localização.";
    console.error(error);
  }
});
