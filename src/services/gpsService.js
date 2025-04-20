import fetch from 'node-fetch';

const getLocation = async () => {
    try {
      const response = await fetch('http://ip-api.com/json/');
      
      return response.json()

    } catch (error) {
      console.error(' Błąd przy pobieraniu lokalizacji:', error.message);
    }
  };

export default getLocation


