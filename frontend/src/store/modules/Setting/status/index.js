
import Service from "@/service/api.js";

const module = {
    namespaced: true,
    state: {
        item: []
    },

    mutations: {
        item(state, obj) {
            state.item = obj;
        }
    },


    // router.get("/message", message.onQuerys);
    // router.post("/message", message.onCreate);
    // router.put("/message", message.onUpdate);
    // router.delete("/message", message.onDelete);

    actions: {
        get({ commit }, data) {
            return Service.status('get', data, {})
                .then((response) => {
                    commit("item", response.data.data)
                    return response.data.data
                }).catch((err) => {
                    throw err;
                });
        },
        post({ dispatch }, data) {
            return Service.status('post', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    throw err;
                });
        },
        put({ dispatch }, data) {
            return Service.status('put', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    throw err;
                });
        },
        delete({ dispatch }, data) {
            return Service.status('delete', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    throw err;
                });
        },
    },

    getters: {
        item(state, obj) {
            return state.item;
        },
    },
};

export default module;
