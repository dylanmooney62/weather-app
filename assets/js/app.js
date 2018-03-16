var DataController = (function () {

  let data = {

  }

  return {

    retrieveData: (address) => {
      var encodedAddress = encodeURIComponent(address);
      var gecodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyDloRCHSAieQojY3yzPn-Xv7anp2mMwPJE`;

      axios.get(gecodeUrl).then((response) => {
        if (response.data.status === 'ZERO_RESULTS') {
          throw new Error('Unable to find that address');
        }

        var lat = response.data.results[0].geometry.location.lat;
        var lng = response.data.results[0].geometry.location.lng;
        data.address = response.data.results[0].formatted_address;

        var weatherUrl = `https://api.darksky.net/forecast/648fccd195ea77efff8037cbafec360a/${lat},${lng}?units=si&exclude=minutely,hourly,alerts,flags`;



        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        return axios.get(proxyurl + weatherUrl);

      }).then((response) => {
        data.weather = response.data;
      }).catch((e) => {
        if (e.code === 'ENOTFOUND') {
          console.log('Unable to connect to API servers.');
        } else {
          console.log(e.message);
        }
      });
    },


    returnData: () => {
      return data;
    },

  }

})();


var UIController = (function () {

  var DOMStrings = {
    searchBar: '.search',
    searchBtn: '.search-btn',
    currentTemp: '.current-temp',
    address: '.address',
    loadingIcon: '.loader',
    main: 'main'

  };

  var displayElements = () => {
    document.querySelector(DOMStrings.loadingIcon).style.display = 'none';
    document.querySelector(DOMStrings.main).style.display = 'block';

  };

  var displayAddress = (obj) => {
    document.querySelector(DOMStrings.address).textContent = obj.address;
  };

  var displayDates = (obj) => {

    var cardDate, theDate, month, day, dayOfMonth, year, dateString

    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    for (var i = 0; i <= 5; i++) {

      cardDate = document.querySelector(`#card-${i}-date`);


      theDate = new Date(obj.weather.daily.data[i].time * 1000);

      day = theDate.getDay();
      month = theDate.getMonth();
      dayOfMonth = theDate.getDate();
      year = theDate.getFullYear();

      dateString = `${days[day]}, ${dayOfMonth} ${months[month]} ${year} `

      cardDate.textContent = dateString;
    }


  };

  var displayDetails = (obj) => {

    var cardPrecipitation, cardWindSpeed, cardHumidity;

    for (var i = 0; i <= 5; i++) {

      cardPrecipitation = document.querySelector(`#card-${i}-precip`);
      cardWindSpeed = document.querySelector(`#card-${i}-wind`);
      cardHumidity = document.querySelector(`#card-${i}-humidity`);

      cardPrecipitation.textContent = Math.round(obj.weather.daily.data[i].precipProbability * 100) + '%';
      cardWindSpeed.textContent = Math.round(obj.weather.daily.data[i].windGust) + 'mph';
      cardHumidity.textContent = Math.round(obj.weather.daily.data[i].humidity * 100) + '%';


    }


  };

  var displayIcons = (obj) => {

    var cardIcon, iconData

    for (var i = 0; i <= 5; i++) {

      cardIcon = document.querySelector(`#card-${i}-icon`);

      data = obj.weather.daily.data[i].icon;

      cardIcon.className = '';
      cardIcon.classList.add('wi')
      cardIcon.classList.add('icon-large')



      if (data.includes('partly-cloudy-day')) {
        cardIcon.classList.add('wi-day-cloudy');
      } else if (data.includes('partly-cloudy-night')) {
        cardIcon.classList.add('wi-night-cloudy');
      } else if (data.includes('cloudy')) {
        cardIcon.classList.add('wi-cloud');
      } else if (data.includes('clear-day')) {
        cardIcon.classList.add('wi-day-sunny');
      } else if (data.includes('clear-night')) {
        cardIcon.classList.add('wi-night-clear');
      } else if (data.includes('rain') || data.includes('sleet')) {
        cardIcon.classList.add('wi-rain');
      } else if (data.includes('snow')) {
        cardIcon.classList.add('wi-snow');
      } else if (data.includes('wind')) {
        cardIcon.classList.add('wi-cloudy-windy');
      } else if (data.includes('fog')) {
        cardIcon.classList.add('wi-fog');
      }


    };

  };


  var displayTemperatures = (obj) => {
    var cardTemperatureLow, cardTemperatureHigh;

    document.querySelector(DOMStrings.currentTemp).textContent = Math.round(obj.weather.currently.temperature) + '°C';

    for (var i = 1; i <= 5; i++) {

      cardTemperatureLow = document.querySelector(`#card-${i}-temp-low`);
      cardTemperatureHigh = document.querySelector(`#card-${i}-temp-high`);

      cardTemperatureHigh.textContent = Math.round(obj.weather.daily.data[i].temperatureHigh) + '°C';
      cardTemperatureLow.textContent = Math.round(obj.weather.daily.data[i].temperatureLow) + '°C';
    }
  };




  return {

    displayWeather: (obj) => {

      displayAddress(obj);
      displayDates(obj);
      displayDetails(obj);
      displayIcons(obj);
      displayTemperatures(obj);
      displayElements();

    },

    getDOMStrings: () => {
      return DOMStrings;
    }
  }

})();






var controller = (function (UICtrl, DataCtrl) {


  var setUpEventListeners = () => {
    var DOMStrings = UICtrl.getDOMStrings();

    var searchBar = document.querySelector(DOMStrings.searchBar)

    searchBar.addEventListener('keypress', function (e) {
      if (event.keyCode === 13 || event.which === 13) {
        updateWeather(this.value);
        this.value = '';
      }

      document.querySelector(DOMStrings.searchBtn).addEventListener('click', function () {
        updateWeather(searchBar.value);

        searchBar.value = '';
      });

    });
  }


  var updateWeather = (address) => {

    // Retreive Data from API
    DataCtrl.retrieveData(address);

    // Wait on Data being recieved
    setTimeout(() => {

      var data = DataCtrl.returnData();

      UICtrl.displayWeather(data);



    }, 2000)



  }



  return {

    init: () => {
      setUpEventListeners();
      updateWeather('London');
    }

  }



})(UIController, DataController);

controller.init();