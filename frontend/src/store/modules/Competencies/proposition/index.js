import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        proposition : [],
    },

    mutations: {
        proposition(state, objs) {
            state.proposition = objs;
        },
    },

    actions: {
        proposition({commit}, data) {
            Service.proposition('get', data, {})
                .then((response) => {
                    commit('proposition', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        createProposition({ dispatch },data) {
            Service.proposition('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch ('proposition')
                }).catch((err) => {
                        console.log(err)
            });
        },
        updateProposition({ dispatch },data) {
            Service.proposition('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch ('proposition')
                }).catch((err) => {
                        console.log(err)
            });
        },
        deleteProposition({ dispatch },data) {
            Service.proposition('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch ('proposition')
                }).catch((err) => {
                        console.log(err)
            });
        },
    },

    getters: {
        proposition(state) {
            return state.proposition;
        },
    },
};
export default ServerModule;
