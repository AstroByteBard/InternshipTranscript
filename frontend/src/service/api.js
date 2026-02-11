import axios from 'axios';
import store from '@/store/store'

const instance = axios.create();
instance.defaults.baseURL = 'http://localhost:8081/api/v1';
instance.defaults.headers = {
    "Content-Type": "application/json",
    // "Api-version": "1.0",
    // "X-Access-Token": "1a661eec9bf358b8567c3dc022146d19c69d2ceafe92f503e89391e5d9f9f739",
}

export default {

    general(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/competencies/softskill", data);
            case 'post':
                return instance.post("/competencies/softskill", data);
            case 'put':
                return instance.put("/competencies/softskill", data);
            case 'delete':
                return instance.delete("/competencies/softskill", { data: data });
            default:
                break;
        }
    },


    specific(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/competencies/hardskill", data);
            case 'post':
                return instance.post("/competencies/hardskill", data);
            case 'put':
                return instance.put("/competencies/hardskill", data);
            case 'delete':
                return instance.delete("/competencies/hardskill", { data: data });
            default:
                break;
        }
    },

    proposition(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/competencies/suggestions", data);
            case 'post':
                return instance.post("/competencies/suggestions", data);
            case 'put':
                return instance.put("/competencies/suggestions", data);
            case 'delete':
                return instance.delete("/competencies/suggestions", { data: data });
            default:
                break;
        }
    },

    emailAdviser(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/email/adviser/explorers", data);
            case 'get':
                return instance.get("/email/adviser", data);
            case 'post':
                return instance.post("/email/adviser", data);
            case 'put':
                return instance.put("/email/adviser", data);
            case 'delete':
                return instance.delete("/email/adviser", { data: data });
            default:
                break;
        }
    },

    emailStudent(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/email/student/explorers", data);
            case 'get':
                return instance.get("/email/student", data);
            case 'post':
                return instance.post("/email/student", data);
            case 'put':
                return instance.put("/email/student", data);
            case 'delete':
                return instance.delete("/email/student", { data: data });
            default:
                break;
        }
    },

    school(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/academic/school/explorers", data);
            case 'get':
                return instance.get("/academic/school", data);
            case 'post':
                return instance.post("/academic/school", data);
            case 'put':
                return instance.put("/academic/school", data);
            case 'delete':
                return instance.delete("/academic/school", data);
            default:
                break;
        }
    },

    program(method, data, configs) {
        switch (method) {
            case 'sendmail':
                return instance.post("/academic/program/sendmail", data);
            case 'get':
                return instance.get("/academic/program", data);
            case 'post':
                return instance.post("/academic/program", data);
            case 'put':
                return instance.put("/academic/program", data);
            case 'delete':
                return instance.delete("/academic/program", data);
            default:
                break;
        }
    },

    course(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/academic/course", data);
            case 'post':
                return instance.post("/academic/course", data);
            case 'put':
                return instance.put("/academic/course", data);
            case 'delete':
                return instance.delete("/academic/course", data);
            default:
                break;
        }
    },

    advisors(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/member/advisors", data);
            case 'post':
                return instance.post("/member/advisors", data);
            case 'put':
                return instance.put("/member/advisors", data);
            case 'delete':
                return instance.delete("/member/advisors", { data: data });
            default:
                break;
        }
    },

    students(method, data, configs) {
        switch (method) {
            case 'get':
                return instance.get("/member/students", data);
            case 'post':
                return instance.post("/member/students", data);
            case 'put':
                return instance.put("/member/students", data);
            case 'delete':
                return instance.delete("/member/students", { data: data });
            default:
                break;
        }
    },

    status(method, data, configs) {
        switch (method) {
            case 'exp':
                return instance.post("/api/v1/setting/status/explorers", data);
            case 'get':
                return instance.get("/api/v1/setting/status");
            case 'post':
                return instance.post("/api/v1/setting/status", data);
            case 'put':
                return instance.put("/api/v1/setting/status", data);
            case 'delete':
                return instance.delete("/api/v1/setting/status");
            default:
                break;
        }
    },
}