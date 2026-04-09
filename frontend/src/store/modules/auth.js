import axios from 'axios';

const state = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

const getters = {
    isAuthenticated: (state) => state.isAuthenticated,
    user: (state) => state.user,
    token: (state) => state.token,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isStudent: (state) => state.user?.role === 'student',
    loading: (state) => state.loading,
    error: (state) => state.error
};

const mutations = {
    setUser(state, user) {
        state.user = user;
    },
    setToken(state, token) {
        state.token = token;
    },
    setAuthenticated(state, value) {
        state.isAuthenticated = value;
    },
    setLoading(state, value) {
        state.loading = value;
    },
    setError(state, error) {
        state.error = error;
    },
    clearAuth(state) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
    }
};

const actions = {
    /**
     * Mock Login with email
     * @param {Object} context - Vuex context
     * @param {string} email - User email
     */
    async mockLogin({ commit }, email) {
        try {
            commit('setLoading', true);
            commit('setError', null);

            // Clear persisted auth to avoid stale user data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');

            const response = await axios.post(
                'http://localhost:8081/api/v1/setting/auth/mock-login',
                { email }
            );

            if (response.data.success && response.data.data) {
                const { user, token } = response.data.data;

                commit('setUser', user);
                commit('setToken', token);
                commit('setAuthenticated', true);

                // Store in localStorage for persistence
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));

                return { user, token };
            } else {
                throw new Error('Login failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            commit('setError', errorMessage);
            throw err;
        } finally {
            commit('setLoading', false);
        }
    },

    /**
     * Restore auth from localStorage
     */
    restoreAuth({ commit }) {
        try {
            const token = localStorage.getItem('auth_token');
            const userStr = localStorage.getItem('auth_user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                commit('setUser', user);
                commit('setToken', token);
                commit('setAuthenticated', true);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error restoring auth:', err);
            return false;
        }
    },

    /**
     * Login as Admin
     */
    async loginAsAdmin({ dispatch }) {
        return dispatch('mockLogin', 'admin@lamduan.mfu.ac.th');
    },

    /**
     * Login as Student (mock)
     */
    async loginAsStudent({ dispatch }) {
        return dispatch('mockLogin', '6631503016@lamduan.mfu.ac.th');
    },

    /**
     * Logout
     */
    logout({ commit }) {
        commit('clearAuth');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    // fetchMockUsers removed
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
