// Sheetbest API URL’sini buraya yapıştır (DEINE_API_ID kısmını kendi API ID’nle değiştir)
const apiUrl =
  "https://api.sheetbest.com/sheets/e21cc39a-5fe1-4d31-8702-dbc1f89b285a";

// Dil ve koordinat eşleştirmesi
const languageCoordinates = {
  Griechisch: [37.9838, 23.7275], // Atina, Yunanistan
  Latein: [41.9028, 12.4964], // Roma, İtalya
  Altäthiopischa: [9.032, 38.7578], // Addis Ababa, Etiyopya
  Persisch: [35.6892, 51.389], // Tahran, İran
  Spanisch: [40.4168, -3.7038], // Madrid, İspanya
  Italienisch: [43.7696, 11.2558], // Floransa, İtalya
  Sanskrit: [25.3176, 82.9739], // Varanasi, Hindistan
  Tamil: [13.0827, 80.2707], // Chennai, Hindistan
  Französisch: [48.8566, 2.3522], // Paris, Fransa
  Englisch: [51.505, -0.09], // Londra, İngiltere
  Hindi: [28.7041, 77.1025], // Delhi, Hindistan
  Syrisch: [33.5138, 36.2765], // Şam, Suriye
  Aramäisch: [36.3418, 43.13], // Musul, Irak
  Türkisch: [41.0082, 28.9784], // İstanbul, Türkiye
};

// Verileri çek ve sayfayı başlat
fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    window.globalData = data; // Verileri global olarak sakla
    populateFilters(data);
    displayData(data);
    initializeMap(data);
    // initializeModal();

    // URL’den filtreyi uygula
    const urlParams = new URLSearchParams(window.location.search);
    const herkunftsprache = urlParams.get("herkunftsprache");
    if (herkunftsprache) {
      document.getElementById("herkunftspracheFilter").value = herkunftsprache;
      filterData(data);
    }
  })
  .catch((error) => {
    console.error("Fehler beim Abrufen der Daten:", error);
    alert(
      "Daten konnten nicht geladen werden. Bitte überprüfen Sie die API-URL."
    );
  });

// Haritayı başlat
function initializeMap(data) {
  const mapContainer = document.getElementById("map");
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Her dil için kelimeleri grupla
  const languageWords = {};
  data.forEach((item) => {
    const language = item.Herkunftssprache;
    if (language && language !== "Hebrew" && languageCoordinates[language]) {
      if (!languageWords[language]) {
        languageWords[language] = [];
      }
      languageWords[language].push(item);
    }
  });

  // Her dil için tek bir işaretleyici ekle
  Object.keys(languageWords).forEach((language) => {
    const words = languageWords[language];
    const [lat, lng] = languageCoordinates[language];
    const marker = L.marker([lat, lng]).addTo(map);
    const popupContent = `
            <b>${language}</b><br>
            <ul>
                ${words
                  .map(
                    (item) => `
                    <li>
                        <b>${item["Arabisches Wort"] || "N/A"}</b><br>
                        Bedeutung: ${item["Bedeutung (Deutsch)"] || "N/A"}<br>
                        Transkription: ${item.Transkription || "N/A"}
                    </li>
                `
                  )
                  .join("")}
            </ul>
            <a href="index.html?herkunftsprache=${encodeURIComponent(
              language
            )}" target="_blank">Alle Wörter dieser Sprache anzeigen</a>
        `;
    marker.bindPopup(popupContent);
  });

  // Haritayı göster/gizle butonu
  const showMapButton = document.getElementById("showMapButton");
  showMapButton.addEventListener("click", () => {
    if (mapContainer.classList.contains("map-hidden")) {
      mapContainer.classList.remove("map-hidden");
      showMapButton.textContent = "Weltkarte ausblenden";
      map.invalidateSize(); // Harita boyutunu güncelle
    } else {
      mapContainer.classList.add("map-hidden");
      showMapButton.textContent = "Weltkarte anzeigen";
    }
  });
}

// Über Uns modalını başlat
// function initializeModal() {
const aboutButton = document.getElementById("aboutButton");
const aboutModal = document.getElementById("aboutModal");
const closeModal = document.getElementById("closeModal");

const showModal = () => {
  aboutModal.style.display = "flex";
};

const hideModal = () => {
  aboutModal.style.display = "none";
};

//   if (aboutButton && aboutModal && closeModal) {
//     aboutButton.addEventListener("click", () => {
//       aboutModal.style.display = "flex";
//     });

//     closeModal.addEventListener("click", () => {
//       aboutModal.style.display = "none";
//     });

//     window.addEventListener("click", (event) => {
//       if (event.target === aboutModal) {
//         aboutModal.style.display = "none";
//       }
//     });
//   } else {
//     console.error("Modal elemanları bulunamadı:", {
//       aboutButton,
//       aboutModal,
//       closeModal,
//     });
//   }
// }

// Filtre menülerini doldur
function populateFilters(data) {
  const thematischeFilter = document.getElementById("thematischeFilter");
  const linguistischeFilter = document.getElementById("linguistischeFilter");
  const herkunftspracheFilter = document.getElementById(
    "herkunftspracheFilter"
  );

  if (!thematischeFilter || !linguistischeFilter || !herkunftspracheFilter) {
    console.error("Filtre elemanları bulunamadı");
    return;
  }

  const thematischeValues = [
    ...new Set(data.map((item) => item["Thematische Kategorie"])),
  ];
  const linguistischeValues = [
    ...new Set(data.map((item) => item["linguistische Kategorie"])),
  ];
  const herkunftspracheValues = [
    ...new Set(data.map((item) => item.Herkunftssprache)),
  ];

  thematischeValues.forEach((value) => {
    if (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      thematischeFilter.appendChild(option);
    }
  });

  linguistischeValues.forEach((value) => {
    if (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      linguistischeFilter.appendChild(option);
    }
  });

  herkunftspracheValues.forEach((value) => {
    if (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      herkunftspracheFilter.appendChild(option);
    }
  });

  thematischeFilter.addEventListener("change", () => filterData(data));
  linguistischeFilter.addEventListener("change", () => filterData(data));
  herkunftspracheFilter.addEventListener("change", () => filterData(data));
}

// Verileri filtrele ve göster
function filterData(data) {
  const thematischeFilter = document.getElementById("thematischeFilter").value;
  const linguistischeFilter = document.getElementById(
    "linguistischeFilter"
  ).value;
  const herkunftspracheFilter = document.getElementById(
    "herkunftspracheFilter"
  ).value;

  const filteredData = data.filter((item) => {
    return (
      (!thematischeFilter ||
        item["Thematische Kategorie"] === thematischeFilter) &&
      (!linguistischeFilter ||
        item["linguistische Kategorie"] === linguistischeFilter) &&
      (!herkunftspracheFilter ||
        item.Herkunftssprache === herkunftspracheFilter)
    );
  });

  displayData(filteredData);
  updateMap(filteredData);
}

// Verileri kartlar halinde göster
function displayData(data) {
  const container = document.getElementById("dataContainer");
  if (!container) {
    console.error("dataContainer bulunamadı");
    return;
  }
  container.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <h2>${item["Arabisches Wort"] || "N/A"}</h2>
            <p><strong>Transkription:</strong> ${
              item.Transkription || "N/A"
            }</p>
            <p><strong>IPA:</strong> ${item.IPA || "N/A"}</p>
            <p><strong>Bedeutung (Deutsch):</strong> ${
              item["Bedeutung (Deutsch)"] || "N/A"
            }</p>
            <p><strong>Herkunftssprache:</strong> ${
              item.Herkunftssprache || "N/A"
            }</p>
            <p><strong>Originalwort:</strong> ${item.Originalwort || "N/A"}</p>
            <p><strong>Übernahmepfad:</strong> ${
              item.Übernahmepfad || "N/A"
            }</p>
            <p><strong>Historischer Kontext:</strong> ${
              item["Historischer Kontext"] || "N/A"
            }</p>
            <p><strong>Linguistische Kategorie:</strong> ${
              item["linguistische Kategorie"] || "N/A"
            }</p>
            <p><strong>Thematische Kategorie:</strong> ${
              item["Thematische Kategorie"] || "N/A"
            }</p>
        `;
    container.appendChild(card);
  });
}

// Haritayı filtreye göre güncelle
function updateMap(data) {
  const mapContainer = document.getElementById("map");
  mapContainer.innerHTML = ""; // Eski haritayı temizle
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Her dil için kelimeleri grupla
  const languageWords = {};
  data.forEach((item) => {
    const language = item.Herkunftssprache;
    if (language && language !== "Hebrew" && languageCoordinates[language]) {
      if (!languageWords[language]) {
        languageWords[language] = [];
      }
      languageWords[language].push(item);
    }
  });

  // Her dil için tek bir işaretleyici ekle
  Object.keys(languageWords).forEach((language) => {
    const words = languageWords[language];
    const [lat, lng] = languageCoordinates[language];
    const marker = L.marker([lat, lng]).addTo(map);
    const popupContent = `
            <b>${language}</b><br>
            <ul>
                ${words
                  .map(
                    (item) => `
                    <li>
                        <b>${item["Arabisches Wort"] || "N/A"}</b><br>
                        Bedeutung: ${item["Bedeutung (Deutsch)"] || "N/A"}<br>
                        Transkription: ${item.Transkription || "N/A"}
                    </li>
                `
                  )
                  .join("")}
            </ul>
            <a href="index.html?herkunftsprache=${encodeURIComponent(
              language
            )}" target="_blank">Alle Wörter dieser Sprache anzeigen</a>
        `;
    marker.bindPopup(popupContent);
  });

  // Harita görünüyorsa boyutunu güncelle
  if (!mapContainer.classList.contains("map-hidden")) {
    map.invalidateSize();
  }
}
