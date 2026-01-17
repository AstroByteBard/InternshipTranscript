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
            Service.members('explorers', data, {})
                .then((response) => {
                    store.commit("academic/major/explore", response.data.data)
                }).catch((err) => {
                    console.log(err)
            });
        },
        school({commit}, data) {
            Service.campus('explorers', data, {})
                .then((response) => {
                    store.commit("academic/school/explore", response.data.data)
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
            return state.school
        }
    },
};

export default ServerModule;
