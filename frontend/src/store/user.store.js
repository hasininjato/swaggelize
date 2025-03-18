import { defineStore } from "pinia";
import axios from "axios";


export const useUserStore = defineStore("user", {
    state: () => ({
        user: {}
    }),

    actions: {
        async getUser() {
            try {
                const userLocalStorage = JSON.parse(localStorage.getItem('user'));
                const accessToken = userLocalStorage.data.access_token;
                // we also need to parse the user's id
                const userId = userLocalStorage.data.id
                const userItem = await axios.get(`http://localhost:8000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })

                this.user = userItem.data;
            } catch (error) {
                // catching errors
                // TODO: use state for error
                if (error.response) {
                    throw { response: error.response };
                } else if (error.request) {
                    throw new Error("Server unavailable");
                } else {
                    throw new Error("Unexpected error")
                }
            }
        }
    },
});