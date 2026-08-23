import { useState, useEffect } from 'react';

// Shared promise to prevent multiple concurrent requests
let fetchPromise = null;

export const useGeolocation = () => {
  const [locData, setLocData] = useState({
    city: 'HYD',
    countryCode: 'IND',
    lat: 17.3850,
    lon: 78.4867,
    fullLocation: 'Hyderabad, Telangana, India',
    ip: 'Unknown'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      // Check cache first
      const cached = sessionStorage.getItem('geo_data');
      if (cached) {
        if (isMounted) {
          setLocData(JSON.parse(cached));
          setLoading(false);
        }
        return;
      }

      // Prevent concurrent identical requests
      if (!fetchPromise) {
        fetchPromise = (async () => {
          let data = {
            city: 'HYD',
            countryCode: 'IND',
            lat: 17.3850,
            lon: 78.4867,
            fullLocation: 'Unknown',
            ip: 'Unknown'
          };

          try {
            // Primary Attempt: freeipapi.com
            const res = await fetch('https://freeipapi.com/api/json');
            if (res.ok) {
              const result = await res.json();
              data.city = result.cityName ? result.cityName.toUpperCase().substring(0, 3) : 'UNK';
              data.countryCode = result.countryCode || 'UNK';
              data.lat = result.latitude || 0;
              data.lon = result.longitude || 0;
              data.fullLocation = [result.cityName, result.regionName, result.countryName].filter(Boolean).join(', ') || 'Unknown';
              data.ip = result.ipAddress || 'Unknown';
            } else {
              throw new Error('Primary failed');
            }
          } catch (err) {
            try {
              // Fallback: ipapi.co
              const res = await fetch('https://ipapi.co/json/');
              if (res.ok) {
                const result = await res.json();
                data.city = result.city ? result.city.toUpperCase().substring(0, 3) : 'UNK';
                data.countryCode = result.country_code || 'UNK';
                data.lat = result.latitude || 0;
                data.lon = result.longitude || 0;
                data.fullLocation = [result.city, result.region, result.country_name].filter(Boolean).join(', ') || 'Unknown';
                data.ip = result.ip || 'Unknown';
              }
            } catch (e) {
              console.error('Geolocation failed:', e);
            }
          }
          return data;
        })();
      }

      try {
        const data = await fetchPromise;
        sessionStorage.setItem('geo_data', JSON.stringify(data));
        if (isMounted) {
          setLocData(data);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { locData, loading };
};
