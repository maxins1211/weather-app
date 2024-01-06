async function getWeather(input) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=56004980ec19444587a63844240201&q=${input}&days=2`
    );
    console.log(response);
    if (!response.ok) {
      throw new Error("Can't find city name, please try again!");
    }
    const data = await response.json();
    console.log(data);
    return {
      name: data["location"]["name"],
      condition: data["current"]["condition"],
      temp: data["current"]["temp_c"],
      forecast: data["forecast"]["forecastday"],
      localTime: data["location"]["localtime"],
    };
  } catch (error) {
    renderError(error.message);
    console.log(error.message);
  }
}

async function updateScreen(input) {
  const data = await getWeather(input);
  const { text: conditionText, icon } = data.condition;
  const { maxtemp_c: highTemp, mintemp_c: lowTemp } = data.forecast[0]["day"];
  const currentHour = getCurrentHour(data.localTime);
  const hourlyData = get24hourData(currentHour, data.forecast);

  renderCurrentWeather(
    data.name,
    conditionText,
    icon,
    data.temp,
    highTemp,
    lowTemp
  );
  console.log(data);
  console.log(currentHour);
  console.log(hourlyData);
  renderHourCards(hourlyData, currentHour);
}

function splitIconSrc(iconData) {
  const src = iconData.split("//cdn.weatherapi.com");
  return src[1].toString();
}

function getCurrentHour(time) {
  const fullTime = time.split(" ")[1];
  const hour = fullTime.split(":")[0];
  return hour;
}

function renderCurrentWeather(
  name,
  conditionData,
  iconSrc,
  dataTemp,
  highTemp,
  lowTemp
) {
  const place = document.createElement("h2");
  const condition = document.createElement("h3");
  const temp = document.createElement("h1");
  const highLowTemp = document.createElement("h4");
  const currentWeatherIcon = document.createElement("img");
  const conditionContainer = document.createElement("div");
  const currentWeather = document.createElement("div");
  const weatherApp = document.querySelector(".weather-app");

  place.textContent = name;
  place.setAttribute("id", "place");
  condition.textContent = conditionData;
  condition.setAttribute("id", "condition");
  currentWeatherIcon.setAttribute("src", `${splitIconSrc(iconSrc)}`);
  currentWeatherIcon.setAttribute("icon", "current-weather-icon");
  temp.textContent = `${dataTemp}°`;
  temp.setAttribute("id", "temp");
  highLowTemp.textContent = `H:${highTemp}° L:${lowTemp}°`;
  highLowTemp.setAttribute("id", "high-low-temp");
  conditionContainer.append(condition, currentWeatherIcon);
  currentWeather.classList.add("current-weather");
  currentWeather.append(place, conditionContainer, temp, highLowTemp);
  weatherApp.appendChild(currentWeather);
}

function get24hourData(time, arr) {
  const data = { currentDay: {}, nextDay: {} };
  let counter = 0;
  //Current day
  for (let i = time; i < 24; i++) {
    const {
      temp_c: temp,
      condition: { icon: iconSrc },
    } = arr[0]["hour"][i];
    data.currentDay[`${i}`] = { temp, iconSrc };
    counter++;
  }
  //Next day
  if (counter < 24) {
    let rest = 24 - counter;
    for (let i = 0; i < rest; i++) {
      const {
        temp_c: temp,
        condition: { icon: iconSrc },
      } = arr[1]["hour"][i];
      data.nextDay[`${i}`] = { temp, iconSrc };
    }
  }
  return data;
}

function renderHourCards(hourlyData, currentHour, day) {
  const hourlyForecast = document.createElement("div");
  const weatherApp = document.querySelector(".weather-app");
  function renderHourCard(dataHour, dataIcon, dataTemp) {
    const h4 = document.createElement("h4");
    const img = document.createElement("img");
    const h3 = document.createElement("h3");
    const div = document.createElement("div");

    h4.textContent = dataHour;
    img.setAttribute("src", dataIcon);
    img.classList.add("icon");
    h3.textContent = `${dataTemp}°`;
    div.append(h4, img, h3);
    div.classList.add("hour-card");
    hourlyForecast.appendChild(div);
  }
  for (let key in hourlyData.currentDay) {
    let keyToNum = +key,
      dataHour,
      dataIcon = hourlyData.currentDay[key].iconSrc,
      dataTemp = hourlyData.currentDay[key].temp;
    keyToNum <= 12
      ? (dataHour = keyToNum + "AM")
      : (dataHour = keyToNum - 12 + "PM");
    if (key === currentHour) {
      dataHour = "Now";
    }
    renderHourCard(dataHour, dataIcon, dataTemp);
  }

  for (let key in hourlyData.nextDay) {
    let keyToNum = +key,
      dataHour,
      dataIcon = hourlyData.nextDay[key].iconSrc,
      dataTemp = hourlyData.nextDay[key].temp;
    keyToNum <= 12
      ? (dataHour = keyToNum + "AM")
      : (dataHour = keyToNum - 12 + "PM");
    if (key === currentHour) {
      dataHour = "Now";
    }
    renderHourCard(dataHour, dataIcon, dataTemp);
  }
  hourlyForecast.classList.add("hourly-forecast");
  weatherApp.appendChild(hourlyForecast);
}

function renderError(msg) {
  const weatherApp = document.querySelector(".weather-app");
  const div = document.createElement("div");
  const p = document.createElement("p");

  p.textContent = msg;
  div.classList.add("error");
  div.appendChild(p);
  weatherApp.appendChild(div);
}

function weatherApp() {
  const btn = document.querySelector("#search");
  const input = document.querySelector("#city");
  const weatherApp = document.querySelector(".weather-app");

  btn.addEventListener("click", () => {
    weatherApp.textContent = "";
    updateScreen(input.value);
    input.value = "";
  });
}

weatherApp();
