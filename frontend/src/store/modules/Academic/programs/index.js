import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        programs: [],
    },

    mutations: {
        programs(state, objs) {
            state.programs = objs;
        },
    },

    actions: {
        programs({ commit }, data) {
            return Service.program('get', data, {})
                .then((response) => {
                    commit('programs', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createPrograms({ dispatch }, data) {
            return Service.program('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updatePrograms({ dispatch }, data) {
            return Service.program('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deletePrograms({ dispatch }, data) {
            return Service.program('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
    },

    getters: {
        programs(state) {
            return state.programs;
        },
    },
};
export default ServerModule;
