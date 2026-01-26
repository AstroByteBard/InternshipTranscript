import Vue from "vue";
import Vuex from "vuex";
import store from "../../store";
import Service from "../../../service/api";

const ServerModule = {
    namespaced: true,
    state: {
        emailAdviser : [],
        emailStudent : [],
    },

    mutations: {
        email(state, objs) {
            
            const Adviser_ID = "69730cdf31640a4d402b0670"
            const Student_ID = "69730cf831640a4d402b0677"

            state.emailAdviser = objs.filter( obj => String(obj.group) === Adviser_ID );
            state.emailStudent = objs.filter( obj => String(obj.group) === Student_ID );
        },
    },

    actions: {
        email({commit}, data) {
            Service.email('get', data, {})
                .then((response) => {
                    commit('email', response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        createEmail({commit},data) {
            Service.email('post', data, {})
                .then(() => {
                    dispatch('email')
                }).catch((err) => {
                        console.log(err)
            });
        },
    },

    getters: {
        emailAdviser(state) {
            return state.emailAdviser;
        },
        emailStudent(state) {
            return state.emailStudent;
        },
    },
};

export default ServerModule;
