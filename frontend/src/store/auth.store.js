import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')),
    }),

    actions: {
        async login(email, password) {
            try {
                const user = await axios.post("http://localhost:8000/api/auth/login", {
                    email, password
                })

                // update pinia state
                this.user = user;

                // store user details and jwt in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            } catch (error) {
                // catching errors
                if (error.response) {
                    throw { response: error.response };
                } else if (error.request) {
                    throw new Error("Server unavailable");
                } else {
                    throw new Error("Unexpected error")
                }
            }
        },
        logout() {
            this.user = null;
            localStorage.removeItem('user');
        },
        async register(fullname, email, password) {
            try {
                const user = await axios.post("http://localhost:8000/api/users", {
                    fullname, email, password
                })
            } catch (error) {
                // catching errors
                if (error.response) {
                    throw { response: error.response };
                } else if (error.request) {
                    throw new Error("Server unavailable");
                } else {
                    throw new Error("Unexpected error")
                }
            }
        },
        async validateToken() {
            const userLocalStorage = JSON.parse(localStorage.getItem('user'));
            const accessToken = userLocalStorage.data.access_token;
            try {
                await axios.get(`http://localhost:8000/api/auth/validate-token?accessToken=${accessToken}`)
                return true;
            } catch (error) {
                return false;
            }
        }
    },
});