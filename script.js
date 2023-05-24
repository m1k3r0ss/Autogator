window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  showInstallPrompt();
});

function showInstallPrompt() {
  // Display an install prompt to the user
  // You can customize this prompt as per your requirements
}

function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Add a class to the body based on the device type
if (isMobileDevice()) {
  document.body.classList.add('mobile');
}

  // Initialize Firebase
  var firebaseConfig = {
      apiKey: "AIzaSyCDd_2Cnzmzt_zoHCELFNZqJzb7KTNF874",
      authDomain: "autogator-782e9.firebaseapp.com",
      databaseURL: "https://autogator-782e9-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "autogator-782e9",
      storageBucket: "autogator-782e9.appspot.com",
      messagingSenderId: "127164675027",
      appId: "1:127164675027:web:a5756fbffea155855db526"
  };

  firebase.initializeApp(firebaseConfig);

// Get a reference to the database
var database = firebase.database();
var dataRef = database.ref('datab');

// Variables to keep track of the progress bar instances
var moistureProgress;
var progressInitialized = false;

// Read data from the database and update the dashboard
function fetchDataAndUpdatePlaceholders() {
  dataRef.once('value', function (snapshot) {
    var dataItems = snapshot.val();

    // Update each placeholder with the retrieved data
    document.getElementById('cityData').textContent = dataItems.city;
    document.getElementById('timeData').textContent = dataItems.time;
    document.getElementById('temperatureData').textContent = dataItems.temp + ' °C';
    document.getElementById('windspeedData').textContent = dataItems.speed + ' km/h';

    var moistureValue = parseFloat(dataItems.moisture);
    var moisturePercentage = (moistureValue / 1024) * 100; // Calculate the percentage

    document.getElementById('moistureData').textContent = moisturePercentage.toFixed(2) + ' %';
    document.getElementById('willRainData').textContent = dataItems.willrain;
    document.getElementById('chanceRainData').textContent = dataItems.chancerain + ' %';

    // Update the circular progress bar for moisture
    if (!progressInitialized) {
      moistureProgress = new ProgressBar.Circle('.grid-item:nth-child(5)', {
        color: '#86c232',
        strokeWidth: 10,
        trailWidth: 10,
        text: {
          value: '',
          className: 'progress-text'
        }
      });
      progressInitialized = true;
    }

    moistureProgress.set(moisturePercentage / 100); // Scale the moisture percentage to a range of 0 to 1
    // Scale the moisture value to a range of 0 to 1
  });
}

var pumpOverrideButton = document.getElementById('pumpOverrideButton');
var pumpRuntimeInput = document.getElementById('pumpRuntimeInput');

// Add click event listener to the pump override button
pumpOverrideButton.addEventListener('click', function() {
  var pumpRuntime = pumpRuntimeInput.value;
  if (pumpRuntime) {
    // Send the pump runtime value to the database
    database.ref('pumpRuntime').set(pumpRuntime);
    console.log('Pump override activated for ' + pumpRuntime + ' minutes.');

    // Set the values in the database for Arduino code to read
    var overrideStatusRef = database.ref('overrideStatus');
    overrideStatusRef.set(true);
    var pumpRuntimeRef = database.ref('pumpRuntimeValue');
    pumpRuntimeRef.set(pumpRuntime);
    console.log('Override status set to true. Pump runtime value set to ' + pumpRuntime);
  } else {
    console.log('Please enter a valid pump runtime.');
  }
});

// Initial data fetch and placeholder update
fetchDataAndUpdatePlaceholders();

// Refresh data every 15 seconds
setInterval(fetchDataAndUpdatePlaceholders, 15000);
