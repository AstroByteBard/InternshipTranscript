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
            return Service.school('get', data, {})
                .then((response) => {
                    commit('schools', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createSchools({ dispatch }, data) {
            return Service.school('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateSchools({ dispatch }, data) {
            return Service.school('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteSchools({ dispatch }, data) {
            return Service.school('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('schools')
                }).catch((err) => {
                    console.log(err)
                    throw err
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
