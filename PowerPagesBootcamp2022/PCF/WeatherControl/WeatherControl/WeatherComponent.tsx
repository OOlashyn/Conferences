import * as React from "react";
///@ts-ignore
import ReactWeather, { useOpenWeather } from 'react-open-weather';

export const WeatherComponent = () => {
    const { data, isLoading, errorMessage } = useOpenWeather({
        key: '5e9e6d9c53f6588ba42f66d9e1f9d370',
        lat: '43.6532',
        lon: '79.3832',
        lang: 'en',
        unit: 'metric', // values are (metric, standard, imperial)
      });
      return (
        <ReactWeather
          isLoading={isLoading}
          errorMessage={errorMessage}
          data={data}
          lang="en"
          locationLabel="Toronto"
          unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
          showForecast
        />
      );
}