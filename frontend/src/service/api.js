import axios from 'axios';
import store from '@/store/store'

const instance = axios.create();
instance.defaults.baseURL = 'http://localhost:8081/api/v1/';
instance.defaults.headers = {
    "Content-Type": "application/json",
    // "Api-version": "1.0",
    // "X-Access-Token": "1a661eec9bf358b8567c3dc022146d19c69d2ceafe92f503e89391e5d9f9f739",
}

export default {

    general(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("competencies/softskill", { params: data });
            case 'post':
                return instance.post("competencies/softskill", data);
            case 'put':
                return instance.put("competencies/softskill", data);
            case 'delete':
                return instance.delete("competencies/softskill", { data: data });
            default:
                break;
        }
    },


    specific(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("competencies/hardskill", { params: data });
            case 'post':
                return instance.post("competencies/hardskill", data);
            case 'put':
                return instance.put("competencies/hardskill", data);
            case 'delete':
                return instance.delete("competencies/hardskill", { data: data });
            default:
                break;
        }
    },

    proposition(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("competencies/suggestions", { params: data });
            case 'post':
                return instance.post("competencies/suggestions", data);
            case 'put':
                return instance.put("competencies/suggestions", data);
            case 'delete':
                return instance.delete("competencies/suggestions", { data: data });
            default:
                break;
        }
    },

    evaluation(method, data, configs) {
        switch (method) {
            case 'query':
                return instance.post("/competencies/evaluation/query", data);
            case 'get':
                return instance.get("/competencies/evaluation", { params: data });
            case 'post':
                return instance.post("/competencies/evaluation", data);
            case 'put':
                return instance.put("/competencies/evaluation", data);
            case 'delete':
                return instance.delete("/competencies/evaluation", { data: data });
            default:
                break;
        }
    },

    emailAdviser(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("email/adviser/explorers", data);
            case 'send':
                return instance.post("email/adviser/send", data);
            case 'get':
                return instance.get("email/adviser", { params: data });
            case 'post':
                return instance.post("email/adviser", data);
            case 'put':
                return instance.put("email/adviser", data);
            case 'delete':
                return instance.delete("email/adviser", { data: data });
            default:
                break;
        }
    },

    emailStudent(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("email/student/explorers", data);
            case 'send':
                return instance.post("email/student/send", data);
            case 'get':
                return instance.get("email/student", { params: data });
            case 'post':
                return instance.post("email/student", data);
            case 'put':
                return instance.put("email/student", data);
            case 'delete':
                return instance.delete("email/student", { data: data });
            default:
                break;
        }
    },

    school(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("academic/school/explorers", data);
            case 'get':
                return instance.get("academic/school", { params: data });
            case 'post':
                return instance.post("academic/school", data);
            case 'put':
                return instance.put("academic/school", data);
            case 'delete':
                return instance.delete("academic/school", data);
            default:
                break;
        }
    },

    program(method, data, configs) {
        switch (method) {
            case 'sendmail':
                return instance.post("academic/program/sendmail", data);
            case 'get':
                return instance.get("academic/program", { params: data });
            case 'post':
                return instance.post("academic/program", data);
            case 'put':
                return instance.put("academic/program", data);
            case 'delete':
                return instance.delete("academic/program", data);
            default:
                break;
        }
    },

    course(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("academic/course", { params: data });
            case 'post':
                return instance.post("academic/course", data);
            case 'put':
                return instance.put("academic/course", data);
            case 'delete':
                return instance.delete("academic/course", data);
            default:
                break;
        }
    },

    advisors(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("member/advisors", { params: data });
            case 'post':
                return instance.post("member/advisors", data);
            case 'put':
                return instance.put("member/advisors", data);
            case 'delete':
                return instance.delete("member/advisors", { data: data });
            default:
                break;
        }
    },

    students(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("member/students", data);
            case 'exp':
                return instance.post("member/students/explore", data);
            case 'post':
                return instance.post("member/students", data);
            case 'put':
                return instance.put("member/students", data);
            case 'delete':
                return instance.delete("member/students", { data: data });
            default:
                break;
        }
    },

    status(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("setting/status/explorers", data);
            case 'get':
                return instance.get("setting/status", { params: data });
            case 'post':
                return instance.post("setting/status", data);
            case 'put':
                return instance.put("setting/status", data);
            case 'delete':
                return instance.delete("setting/status", { data: data });
            default:
                break;
        }
    },

    documents(method, data, configs) {
        switch (method) {
            case 'get':
                if (!data) return instance.get("documents");
                if (typeof data === 'string') return instance.get(`documents/${data}`);
                if (data._id) return instance.get(`documents/${data._id}`);
                return instance.get("documents", { params: data });
            case 'post':
                return instance.post("documents", data);
            case 'put':
                return instance.put("documents", data);
            case 'delete':
                return instance.delete("documents", { data: data });
            default:
                break;
        }
    },

    evaluation(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("competencies/evaluation", { params: data });
            case 'post':
                return instance.post("competencies/evaluation", data);
            case 'query':
                return instance.post("competencies/evaluation/query", data);
            case 'put':
                return instance.put("competencies/evaluation", data);
            case 'delete':
                return instance.delete("competencies/evaluation", { data: data });
            default:
                break;
        }
    },

    province(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("setting/province", { params: data });
            case 'post':
                return instance.post("setting/province", data);
            case 'put':
                return instance.put("setting/province", data);
            case 'delete':
                return instance.delete("setting/province", { data: data });
            default:
                break;
        }
    },
}