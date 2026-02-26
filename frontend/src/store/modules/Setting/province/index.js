import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        province: [],
    },

    mutations: {
        province(state, objs) {
            state.province = objs;
        },
    },

    actions: {
        province({ commit }, data) {
            Service.province('get', data, {})
                .then((response) => {
                    commit('province', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createProvince({ dispatch }, data) {
            Service.province('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateProvince({ dispatch }, data) {
            Service.province('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                });
        },
        deleteProvince({ dispatch }, data) {
            Service.province('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        province(state) {
            return state.province;
        },
    },
};
export default ServerModule;
