import Service from "../../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        emailTransactionAdviser: [],
    },

    mutations: {
        emailTransactionAdviser(state, objs) {
            state.emailTransactionAdviser = objs;
        },
    },

    actions: {
        get({ commit }, data) {
            Service.emailTransactionAdviser('get', data, {})
                .then((response) => {
                    commit('emailTransactionAdviser', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        create({ dispatch }, data) {
            Service.emailTransactionAdviser('post', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
        update({ dispatch }, data) {
            Service.emailTransactionAdviser('put', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
        delete({ dispatch }, data) {
            Service.emailTransactionAdviser('delete', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        emailTransactionAdviser(state) {
            return state.emailTransactionAdviser;
        },
    },
};
export default ServerModule;
