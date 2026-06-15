import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        advisors: [],
    },

    mutations: {
        advisors(state, objs) {
            state.advisors = objs;
        },
    },

    actions: {
        advisors({ commit }, data) {
            return Service.advisors('get', data, {})
                .then((response) => {
                    commit('advisors', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createAdvisors({ dispatch }, data) {
            return Service.advisors('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('advisors')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateAdvisors({ dispatch }, data) {
            return Service.advisors('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('advisors')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteAdvisors({ dispatch }, data) {
            return Service.advisors('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('advisors')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
    },

    getters: {
        advisors(state) {
            return state.advisors;
        },
    },
};
export default ServerModule;
