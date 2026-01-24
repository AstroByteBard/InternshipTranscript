import Vue from "vue";
import Service from "../../../service/api";

const StudentsModule = {
    namespaced: true,
    state: {
        students: []
    },

    mutations: {
        students(state, obj) {
            state.students = obj;
        }
    },

    actions: {
        getstudents({ commit }, data) {
            Service.students('get', data, {})
                .then((response) => {
                    console.log(response.data.data)
                    commit('students', response.data.data)
                }).catch((err) => {
                    console.log(err)
                });
        },
    },

    getters: {
        students(state) {
            return state.students;
        }
    },
};

export default StudentsModule;