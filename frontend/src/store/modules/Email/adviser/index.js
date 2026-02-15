import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        emailAdviser : [],
    },

    mutations: {
        email(state, objs) {
            state.emailAdviser = objs;
        },
    },

    actions: {
        email({commit}, data) {
            Service.emailAdviser('get', data, {})
                .then((response) => {
                    commit('email', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        createEmail({ dispatch },data) {
            Service.emailAdviser('post', data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                    return dispatch ('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
        updateEmail({ dispatch },data) {
            Service.emailAdviser('put', data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                    return dispatch ('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
        deleteEmail({ dispatch },data) {
            Service.emailAdviser('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบอีเมล : ', response.data)
                    return dispatch ('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
    },

    getters: {
        emailAdviser(state) {
            return state.emailAdviser;
        },
    },
};
export default ServerModule;