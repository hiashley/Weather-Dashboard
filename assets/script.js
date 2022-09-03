var searchCityInput = $('#search-city');
var searchCityBtn = $('#search-city-btn');
var searchHistoryList = $('#search-history-list');
var clearHistoryBtn = $('#clear-history');

var weatherArea = $('#weather-area');
var currentCity = $('#current-city');
var currentTemp = $('#current-temp');
var currentWind = $('#current-wind');
var currentHumidity = $('#current-humidity');
var uvIndex = $('#uv-index')

var forecast = $('#weekly-forecast');

// OpenWeatherMap API Key
var APIkey = '59f70ca4412af421a6b655b27ef87da8';

// Use moment.js to find current date
var currentDate = moment().format('l');
$("#current-date").text(currentDate);

var searchValue;
// Store cities in empty array in localstorage
var cityList = [];

getSearchHistory();

// When hitting enter
$(document).on('submit',(event) => {
  event.preventDefault();

  var searchValue = searchCityInput.val().trim();

  requestWeather(searchValue);
  searchHistory(searchValue);
  searchCityInput.val('');
});

// When clicking the button
searchCityBtn.on('click', (event) => {
  event.preventDefault();

  var searchValue = searchCityInput.val().trim();

  requestWeather(searchValue);
  searchHistory(searchValue);
  searchCityInput.val('');
});

clearHistoryBtn.on('click', () => {
  cityList = [];
  cityListArray();
});

searchHistoryList.on('click', 'li.city-btn', function(event) {
  event.preventDefault();
  var value = $(this).data('value');
  requestWeather(value);
  searchHistory(value);
});

// Fetch data from API
function requestWeather(searchValue) {
  // Fetch current city weather
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + APIkey;

  fetch(queryURL, {
    method: 'GET',
  })
  .then(function (response) {
    return response.json();
  })  
  .then(function (data) {
    console.log(data);
    currentCity.text(data.name);
    currentCity.append("<small class='text-muted' id='current-date'>");
      $("#current-date").text(` ${currentDate}`);
    currentCity.append("<img src='https://openweathermap.org/img/w/" + data.weather[0].icon + ".png' alt='" + data.weather[0].main + "' />")
    currentTemp.text(data.main.temp);
    currentTemp.append('&deg;F');
    currentHumidity.text(data.main.humidity + '%');
    currentWind.text(data.wind.speed + ' mph');

    var lat = data.coord.lat;
    var lon = data.coord.lon;
    
  // Fetch UV Index for current city
  var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;

  fetch(uvIndexURL, {
    method: 'GET',
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    uvIndex.text(data.value);
  })
  });

  // Fetch Weekly Forecast
  var weeklyURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&units=imperial&appid=" + APIkey;

  fetch(weeklyURL, {
    method: 'GET',
  })
  .then (function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    forecast.empty();

    for (var i = 1; i < data.list.length; i+=8) {
      var dateList = moment(data.list[i].dt_txt).format("l");
      console.log(dateList);

      var forecastCard = $('<div class="col-2 card">');
      var forecastCardBody = $('<div class="card-body">');
      var forecastCardDate = $('<h5 class="card-title">');
      var forecastImg = $('<img>');
      var forecastTemp = $('<p class="card-text mb-0">');
      var forecastWind = $('<p class="card-text mb-0">')
      var forecastHumidity = $('<p class="card-text">');

      forecast.append(forecastCard);
      forecastCard.append(forecastCardBody);
      forecastCardBody.append(forecastCardDate);
      forecastCardBody.append(forecastImg);
      forecastCardBody.append(forecastTemp);
      forecastCardBody.append(forecastWind);
      forecastCardBody.append(forecastHumidity);

      forecastImg.attr('src', "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
      forecastCardDate.text(dateList);
      forecastTemp.text(`Temp: ${data.list[i].main.temp}`);
      forecastTemp.append("&deg;F");
      forecastWind.text(`Wind: ${data.list[i].wind.speed} mph`);
      forecastHumidity.text(`Humidity: ${data.list[i].main.humidity}%`);
    }
  })
}

function searchHistory(searchValue) {
  if (searchValue) {
    // If it is a nonexisting input, add that new input to the array.
    if (cityList.indexOf(searchValue) === -1) {
      cityList.push(searchValue);

      cityListArray();
      clearHistoryBtn.removeClass('hide');
      weatherArea.removeClass('hide');
    } else {
      var removeIndex = cityList.indexOf(searchValue);
      cityList.splice(removeIndex, 1);

      cityList.push(searchValue);
      cityListArray();
      clearHistoryBtn.removeClass('hide');
      weatherArea.removeClass('hide');
    }
  }
}

// List cities in sidebar
function cityListArray() {
  searchHistoryList.empty();
  cityList.forEach(function(city) {
    var searchHistoryCard = $('<li class="list-group-item city-btn">');
    searchHistoryCard.attr('data-value', city);
    searchHistoryCard.text(city);
    searchHistoryList.prepend(searchHistoryCard);
  });
  localStorage.setItem('cities', JSON.stringify(cityList));
}

// Grab from localStorage
function getSearchHistory() {
  if (localStorage.getItem("cities")) {
      cityList = JSON.parse(localStorage.getItem("cities"));
      var lastIndex = cityList.length - 1;
      cityListArray();
      if (cityList.length !== 0) {
          requestWeather(cityList[lastIndex]);
          weatherArea.removeClass("hide");
      }
  }
}