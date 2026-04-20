import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        proposition: [],
    },

    mutations: {
        proposition(state, objs) {
            state.proposition = objs;
        },
    },

    actions: {
        proposition({ commit }, data) {
            return Service.proposition('get', data, {})
                .then((response) => {
                    commit('proposition', response.data.data)
                    return response
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createProposition({ dispatch }, data) {
            Service.proposition('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('proposition')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateProposition({ dispatch }, data) {
            Service.proposition('put', data, {})
                .then((response) => {
                    alert('Updated successfully')
                    return dispatch('proposition')
                }).catch((err) => {
                    alert('Update failed: ' + err.message)
                    console.log(err)
                });
        },
        deleteProposition({ dispatch }, data) {
            const payload = (data && typeof data === 'object') ? data : { _id: data }
            Service.proposition('delete', payload, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('proposition')
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
