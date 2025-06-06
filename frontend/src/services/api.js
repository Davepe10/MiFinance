const API_URL = "https://mifinance.onrender.com";

export const registerUser = async (email) => {
  const response = await axios.post(`${API_URL}/register`, { email });
  return response.data;
};

export const sendTransaction = async (data, token) => {
  const response = await axios.post(`${API_URL}/add_data`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchData = async (token) => {
  const response = await axios.get(`${API_URL}/data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
