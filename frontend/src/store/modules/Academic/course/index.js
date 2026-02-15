import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        course: [],
    },

    mutations: {
        course(state, objs) {
            state.course = objs;
        },
    },

    actions: {
        course({ commit }, data) {
            Service.course('get', data, {})
                .then((response) => {
                    commit('course', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
        createCourse({ dispatch }, data) {
            Service.course('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                });
        },
        updateCourse({ dispatch }, data) {
            Service.course('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                });
        },
        deleteCourse({ dispatch }, data) {
            Service.course('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        course(state) {
            return state.course;
        },
    },
};
export default ServerModule;
