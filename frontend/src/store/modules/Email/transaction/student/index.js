import Service from "../../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        emailTransactionStudent: [],
    },

    mutations: {
        emailTransactionStudent(state, objs) {
            state.emailTransactionStudent = objs;
        },
    },

    actions: {
        get({ commit }, data) {
            Service.emailTransactionStudent('get', data, {})
                .then((response) => {
                    commit('emailTransactionStudent', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        create({ dispatch }, data) {
            Service.emailTransactionStudent('post', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
        update({ dispatch }, data) {
            Service.emailTransactionStudent('put', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
        delete({ dispatch }, data) {
            Service.emailTransactionStudent('delete', data, {})
                .then((response) => {
                    return dispatch('get')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        emailTransactionStudent(state) {
            return state.emailTransactionStudent;
        },
    },
};
export default ServerModule;
