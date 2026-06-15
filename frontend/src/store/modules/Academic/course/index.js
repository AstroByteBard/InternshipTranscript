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
            return Service.course('get', data, {})
                .then((response) => {
                    commit('course', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createCourse({ dispatch }, data) {
            return Service.course('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateCourse({ dispatch }, data) {
            return Service.course('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteCourse({ dispatch }, data) {
            return Service.course('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('course')
                }).catch((err) => {
                    console.log(err)
                    throw err
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
