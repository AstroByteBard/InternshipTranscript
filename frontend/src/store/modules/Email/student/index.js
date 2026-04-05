import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        emailStudent : [],
    },

    mutations: {
        email(state, objs) {
            state.emailStudent = objs;
        },
    },

    actions: {
        email({commit}, data) {
            Service.emailStudent('get', data, {})
                .then((response) => {
                    commit('email', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        createEmail({ dispatch },data) {
            Service.emailStudent('post', data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                    return dispatch ('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
        updateEmail({ dispatch },data) {
            Service.emailStudent('put', data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                    return dispatch ('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
        deleteEmail({ dispatch }, data) {
            Service.emailStudent('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบอีเมล : ', response.data)
                    return dispatch('email')
                }).catch((err) => {
                    console.log(err)
                });
        },
        sendEmail({ dispatch }, data) {
            Service.emailStudent('send', data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                    return dispatch('email')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        emailStudent(state) {
            return state.emailStudent;
        },
    },
};
export default ServerModule;