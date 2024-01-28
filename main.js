

// import { getData, updateCityUI } from './data/data.js';

document.addEventListener("DOMContentLoaded", function () {
  getData()
    .then(data => {
      updateCityUI(data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
});

// (London, Milan, Bangkok, Los Angeles, Nairobi)

const apiKey = '3e3e2493caf89d46b38ea47b66f38caf'

const cities = [
  {
    id : 0,
    name : 'London',
  },
  {
    id : 1,
    name : 'Milan',
  },
  {
    id : 2,
    name : 'Bangkok',
  },
  {
    id : 3,
    name : 'Los%20Angeles',
  },
  {
    id : 4,
    name : 'Nairobi',
  }
]

let slide_container = document.querySelector('.widget');
let slide = document.querySelectorAll('.slide');
let dots = document.querySelectorAll('.dot')
const days = document.querySelector('.days');

let isCreateDaysExecuted = true;
var current = 0;
var cityName = 'london';

// touch variables
  let isDragging = false,
  startPos = 0,
  currentTranslate = 0,
  prevTranslate = 0,
  currentIndex = 0




// Get data and create Element
export async function getData() {
  const cityUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  try {
    const cityResponse = await fetch(cityUrl);

    if (!cityResponse.ok) {
      throw new Error(`HTTP error! Status: ${cityResponse.status}`);
    }

    const cityData = await cityResponse.json();
    console.log(cityData);
    const cityCoords = cityData.coord;

    const baseUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${cityCoords.lat}&lon=${cityCoords.lon}&appid=${apiKey}&units=metric`;

    const weatherResponse = await fetch(baseUrl);

    if (!weatherResponse.ok) {
      throw new Error(`HTTP error! Status: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    updateCityUI(weatherData);

    return weatherData;
  } catch (error) {
    console.error('There has been a problem with your fetch request:', error);
    throw error;
  }
}

export function updateCityUI(data) {
  
  const cityElement = document.querySelector('.city_name');
  const weatherElement = document.querySelector('.weather');
  const temperatureElement = document.querySelector('.temperature');
  const rangeTemperatureElement = document.querySelector('.range_temperature');

  cityElement.textContent = decodeURIComponent(cityName);
  weatherElement.textContent = data.current.weather[0].main;
  temperatureElement.textContent = `${Math.round(data.current.temp)}°`;
  rangeTemperatureElement.textContent = `${Math.floor(data.daily[0].temp.min)}°/ ${Math.ceil(data.daily[0].temp.max)}°`;
  
  // console.log(data.daily);
  
  createDays(data);

}

export function createDays(data) {
  if (isCreateDaysExecuted) {
  data.daily.slice(1, 8).map((value, i)=>{
    const dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
      weekday: "short",
    });
    
    const weatherIcon = `http://openweathermap.org/img/w/${value.weather[0].icon}.png`

    const day_template = `
      <div class="single_day">
        <p class="name_day_${i} text_uppercase">${dayname}</p>
        <img class="weather_image_${i}" src="${weatherIcon}" alt="weather-${dayname}">
        <div class="range_temperature_day_0 ">${Math.floor(value.temp.min)}°/ ${Math.ceil(value.temp.max)}°</div>
      </div>
      `
      const dayElement = document.createElement("div");
      dayElement.innerHTML = day_template.trim();
      days.appendChild(dayElement.firstChild);
      
    })
    isCreateDaysExecuted = false;
  }
}


export function updateDays(data) {
  while (days.firstChild) {
    days.removeChild(days.firstChild);
  }
  createDays(data);
}

// Touch slider function

slide_container.addEventListener('touchstart', touchStart);
slide_container.addEventListener('touchend', touchEnd);
slide_container.addEventListener('touchmove', touchMove);

function touchStart(event) {
  startPos = event.touches[0].clientX;
  isDragging = true;
}

function touchEnd() {
  isDragging = false;
  const move = currentTranslate - prevTranslate;

  if (move > 50 && currentIndex < slide.length - 1) {
    prevCity();
    getData(cityName);
    updateDays();
  } else if (move < -50 && currentIndex > 0) {
    nextCity();
    getData(cityName);
    updateDays();
  }

  currentIndex = current;
}

function touchMove(event) {
  if (isDragging) {
    const currentPosition = event.touches[0].clientX;
    currentTranslate = prevTranslate + currentPosition - startPos;
  }
}

// Carousel and pagination function
function clearSlides(){
  for (let i = 0; i < slide.length; i++) {
    slide[i].style.display = 'none'
    dots[i].classList.remove('active')
  }

}

function nextCity(){
  clearSlides();

  if(current === slide.length-1) current = -1;
  current++;
  cityName = cities[current].name
  slide[current].style.display = 'block';
  slide[current].style.opacity = '0.7';
  dots[current].classList.add('active');
  isCreateDaysExecuted = true;

}

function prevCity(){
  clearSlides();
  if(current === 0) current = slide.length;
  current--;

  cityName = cities[current].name;
  slide[current].style.display = 'block';
  slide[current].style.opacity = '0.7';
  dots[current].classList.add('active');

  isCreateDaysExecuted = true;
}

function start(){
  clearSlides();
  slide[current].style.display ='block';
  slide[current].style.opacity = '0.8';
  dots[current].classList.add('active');


}


// Init the the first slide
start();

// change city with dot

dots.forEach((dot, i) => {
  dot.addEventListener('click', function(){
    cityName = cities[i].name
    getData(cityName);
    clearSlides();
    slide[i].style.display ='block';
    slide[i].style.opacity = '0.8';
    dots[i].classList.add('active');
    updateDays();
    isCreateDaysExecuted = true;
  });
});


// Button for change slide
  const btnRight = document.querySelector('.arrow.r span')
  btnRight.addEventListener('click', function(){
    console.log(cityName);
    nextCity();
    getData(cityName);
    updateDays();
  })

  const btnLeft = document.querySelector('.arrow.l span')
  btnLeft.addEventListener('click', function(){
    prevCity();
    getData (cityName)
    updateDays();
  })


