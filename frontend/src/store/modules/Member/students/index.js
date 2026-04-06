import Service from "../../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        students: [],
    },

    mutations: {
        students(state, objs) {
            state.students = objs;
        },
    },

    actions: {
        students({ commit }, data) {
            return Service.students('get', data, {})
                .then((response) => {
                    commit('students', response.data.data)
                    return response.data.data
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        createStudents({ dispatch }, data) {
            return Service.students('post', data, {})
                .then((response) => {
                    console.log('สถานนะการบันทึก : ', response.data)
                    return dispatch('students')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        updateStudents({ dispatch }, data) {
            return Service.students('put', data, {})
                .then((response) => {
                    console.log('สถานนะการแก้ไข : ', response.data)
                    return dispatch('students')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
        deleteStudents({ dispatch }, data) {
            return Service.students('delete', data, {})
                .then((response) => {
                    console.log('สถานนะการลบ : ', response.data)
                    return dispatch('students')
                }).catch((err) => {
                    console.log(err)
                    throw err
                });
        },
    },

    getters: {
        students(state) {
            return state.students;
        },
    },
};
export default ServerModule;
