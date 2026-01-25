import Vue from "vue";
import Service from "../../../service/api";

const StudentsModule = {
    namespaced: true,
    state: {
        students: []
    },

    mutations: {
        students(state, obj) {
            state.students = Array.isArray(obj) ? obj : [];
        },
        updateStudentInList(state, updatedStudent) {
            // Find the index of the student to update
            const index = state.students.findIndex(student => student._id === updatedStudent._id);
            if (index !== -1) {
                // Replace the old student object with the updated one
                state.students.splice(index, 1, {
                    ...state.students[index],
                    ...updatedStudent
                });
            }
        },

        removeStudentFromList(state, studentId) {
            // Remove the student with the given _id from the array
            state.students = state.students.filter(student => student._id !== studentId);
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

        updateStudent({ commit }, data) {
            return Service.students('put', data, {})
                .then((response) => {
                    console.log(response.data)
                    // response.data should be the updated student object
                    if (response.data && response.data._id) {
                        commit('updateStudentInList', response.data);
                    }
                    return response;
                }).catch((err) => {
                    console.log(err)
                    throw err;
                });
        },

        deleteStudent({ commit }, data) {
            return Service.students('delete', { _id: data.id }, {})
                .then((response) => {
                    console.log(response.data)
                    // Remove from state by id
                    commit('removeStudentFromList', data.id);
                    return response;
                }).catch((err) => {
                    console.log(err)
                    throw err;
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