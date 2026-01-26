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

    email(method, data, configs) {
        switch (method) {
            case 'exp': 
                return instance.post("/email/explorers", data);
            case 'get':
                return instance.get("/email", data);
            case 'post':
                return instance.post("/email", data);
            case 'put':
                return instance.put("/email", data);
            case 'delete':
                return instance.delete("/email", data);
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

    major(method, data, configs) {
        switch (method) {
            case 'sendmail': 
                return instance.post("/academic/major/sendmail", data);
            case 'get':
                return instance.get("/academic/major", data);
            case 'post':
                return instance.post("/academic/major", data);
            case 'put':
                return instance.put("/academic/major", data);
            case 'delete':
                return instance.delete("/academic/major", data);
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

    students(method, data, configs) {
    switch (method) {
        case 'exp': 
            return instance.post("/students/explorers", data);
        case 'get':
            return instance.get("/students", data);
        case 'post':
            return instance.post("/students", data);  // ส่ง JSON ปกติ
        case 'put':
            return instance.put("/students", data);
        case 'delete':
            return instance.delete("/students", { data: data });
        case 'import':
            return instance.post("/students/import", data, {
                headers:{
                    "Content-Type": "multipart/form-data",  
                },
                ...configs
            });
        default:
            break;
    }
},



}