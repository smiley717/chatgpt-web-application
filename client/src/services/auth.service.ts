import axios from 'axios';
import exp from 'constants';

export const register = async (username: string, email: string, password: string) => {
    const response = await axios.post("/signup", {
        username,
        email,
        password
    });
};

export const login = async (username: string, password: string) => {
    const response = await axios.post("/signin", {
        username,
        password
    });

    if(response.data.accessToken){
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

export const logout = async () => {
    localStorage.removeItem("user");
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
};