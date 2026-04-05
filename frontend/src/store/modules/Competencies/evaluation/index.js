import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        evaluations: [],
    },

    mutations: {
        evaluations(state, objs) {
            state.evaluations = objs;
        },
    },

    actions: {
        evaluations({ commit }, data) {
            Service.evaluation('get', data, {})
                .then((response) => {
                    commit('evaluations', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createEvaluation({ dispatch }, data) {
            return Service.evaluation('post', data, {})
                .then((response) => {
                    console.log('Save status: ', response.data)
                    dispatch('evaluations')
                    return response.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateEvaluation({ dispatch }, data) {
            return Service.evaluation('put', data, {})
                .then((response) => {
                    console.log('Update status: ', response.data)
                    dispatch('evaluations')
                    return response.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteEvaluation({ dispatch }, data) {
            return Service.evaluation('delete', data, {})
                .then((response) => {
                    console.log('Delete status: ', response.data)
                    dispatch('evaluations')
                    return response.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
    },

    getters: {
        evaluations(state) {
            return state.evaluations;
        },
    },
};
export default ServerModule;
