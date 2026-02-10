import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        general : [],
    },

    mutations: {
        general(state, objs) {
            state.general = objs;
        },
    },

    actions: {
        general({commit}, data) {
            Service.general('get', data, {})
                .then((response) => {
                    commit('general', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        createGeneral({ dispatch },data) {
            Service.general('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch ('general')
                }).catch((err) => {
                        console.log(err)
            });
        },
        updateGeneral({ dispatch },data) {
            Service.general('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch ('general')
                }).catch((err) => {
                        console.log(err)
            });
        },
        deleteGeneral({ dispatch },data) {
            Service.general('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch ('general')
                }).catch((err) => {
                        console.log(err)
            });
        },
    },

    getters: {
        general(state) {
            return state.general;
        },
    },
};
export default ServerModule;
