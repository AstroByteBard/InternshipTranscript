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

    actions: {
        get({ commit }, data) {
            return Service.semester('get', data, {})
                .then((response) => {
                    commit("item", response.data.data)
                    return response.data.data
                }).catch((err) => {
                    throw err;
                });
        },
        post({ dispatch }, data) {
            return Service.semester('post', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    throw err;
                });
        },
        put({ dispatch }, data) {
            return Service.semester('put', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    throw err;
                });
        },
        delete({ dispatch }, data) {
            return Service.semester('delete', data, {})
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
