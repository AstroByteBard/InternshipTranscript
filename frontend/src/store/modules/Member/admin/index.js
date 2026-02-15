import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        admin: [],
    },

    mutations: {
        admin(state, objs) {
            state.admin = objs;
        },
    },

    actions: {
        admin({ commit }, data) {
            Service.admin('get', data, {})
                .then((response) => {
                    commit('admin', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createAdmin({ dispatch }, data) {
            Service.admin('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('admin')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateAdmin({ dispatch }, data) {
            Service.admin('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('admin')
                }).catch((err) => {
                    console.log(err)
                });
        },
        deleteAdmin({ dispatch }, data) {
            Service.admin('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('admin')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        admin(state) {
            return state.admin;
        },
    },
};
export default ServerModule;
