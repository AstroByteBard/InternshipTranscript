import Vue from "vue";
import Vuex from "vuex";
import store from "../../store";
import Service from "../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        major : [],
        school : []
    },

    mutations: {
        major(state, obj) {
            state.major = obj;
        },
        school(state, obj) {
            state.school = obj
        }
    },

    actions: {
        major({commit}, data) {
            Service.major('get', data, {})
                .then((response) => {
                    commit('major', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        sendMajor({},data){
            Service.major('sendmail',data, {})
                .then((response) => {
                    console.log('สถานนะการส่งอีเมล : ', response.data)
                }).catch((err) => {
                            console.log(err)
            });
        }
        ,
        school({commit}, data) {
            Service.school('get', data, {})
                .then((response) => {
                    commit('school', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        }
    },

    getters: {
        major(state) {
            return state.major;
        },

        school(state) {
            return state.school;
        }
    },
};

export default ServerModule;
