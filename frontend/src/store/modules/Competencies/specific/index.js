import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        specific: [],
    },

    mutations: {
        specific(state, objs) {
            state.specific = objs;
        },
    },

    actions: {
        specific({ commit }, data) {
            return Service.specific('get', data, {})
                .then((response) => {
                    commit('specific', response.data.data)
                    return response
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createSpecific({ dispatch }, data) {
            Service.specific('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('specific')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateSpecific({ dispatch }, data) {
            Service.specific('put', data, {})
                .then((response) => {
                    alert('Updated successfully')
                    return dispatch('specific')
                }).catch((err) => {
                    alert('Update failed: ' + err.message)
                    console.log(err)
                });
        },
        deleteSpecific({ dispatch }, data) {
            const payload = (data && typeof data === 'object') ? data : { _id: data }
            Service.specific('delete', payload, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('specific')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        specific(state) {
            return state.specific;
        },
    },
};
export default ServerModule;
