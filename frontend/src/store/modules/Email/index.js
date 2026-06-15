import emailAdviser from "./adviser";
import emailStudent from "./student";
import emailTransactionAdviser from "./transaction/adviser";
import emailTransactionStudent from "./transaction/student";

const ServerModule = {
    namespaced: true,
    modules: {
        emailAdviser,
        emailStudent,
        emailTransactionAdviser,
        emailTransactionStudent,
    },

    state: {
    },

    mutations: {
    
    },

    actions: {

    },

    getters: {
        
    },
};

export default ServerModule;
