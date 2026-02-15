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
            Service.program('get', data, {})
                .then((response) => {
                    commit('programs', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createPrograms({ dispatch }, data) {
            Service.program('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updatePrograms({ dispatch }, data) {
            Service.program('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
                });
        },
        deletePrograms({ dispatch }, data) {
            Service.program('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('programs')
                }).catch((err) => {
                    console.log(err)
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
