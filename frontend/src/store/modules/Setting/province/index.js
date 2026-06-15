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
            return Service.province('get', data, {})
                .then((response) => {
                    commit('province', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createProvince({ dispatch }, data) {
            return Service.province('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateProvince({ dispatch }, data) {
            return Service.province('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteProvince({ dispatch }, data) {
            return Service.province('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('province')
                }).catch((err) => {
                    console.log(err)
                    throw err
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
