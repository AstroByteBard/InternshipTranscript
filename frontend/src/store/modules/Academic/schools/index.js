import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        schools: [],
    },

    mutations: {
        schools(state, objs) {
            state.schools = objs;
        },
    },

    actions: {
        schools({ commit }, data) {
            Service.school('get', data, {})
                .then((response) => {
                    commit('schools', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createSchools({ dispatch }, data) {
            Service.school('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateSchools({ dispatch }, data) {
            Service.school('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                });
        },
        deleteSchools({ dispatch }, data) {
            Service.school('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        schools(state) {
            return state.schools;
        },
    },
};
export default ServerModule;
