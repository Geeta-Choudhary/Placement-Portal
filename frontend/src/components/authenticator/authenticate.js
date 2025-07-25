import axios from "axios";

class PlacementClient {
    async get(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error.message);
            throw error; // Re-throw to let the caller handle it if needed
        }
    }

    async post(url , payload){
        try {
          const response = await axios.post(url, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          return response.data;
        } catch (error) {
          console.error('Error in post request:', error);
          throw error;
        }
    };
    async put(url , payload){
        try {
          const response = await axios.put(url, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          return response.data;
        } catch (error) {
          console.error('Error in post request:', error);
          throw error;
        }
    };

    async delete(url){
        try {
          const response = await axios.delete(url, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          return response.data;
        } catch (error) {
          console.error('Error in deleting :', error);
          throw error;
        }
      };

}

export default new PlacementClient();