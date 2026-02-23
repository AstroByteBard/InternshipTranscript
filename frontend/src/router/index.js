import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer_Project = () => import('@/containers/TheContainer_Project')


// project 
const Dashboard = () => import('@/projects/views/administration/Dashboard')
const Login = () => import('@/projects/views/Login')

//administrator
const Administrator = () => import('@/projects/views/administration/Administrator')
const AdminForm = () => import('@/projects/views/administration/Form')

//documents
const Documents = () => import('@/projects/views/administration/documents/index')
const CreateDocument = () => import('@/projects/views/administration/documents/CreateDocument')

// competencies
const Competencies = () => import('@/projects/views/administration/Competencies')

//correspondence
const Correspondence = () => import('@/projects/views/administration/Correspondence')


Vue.use(Router)

export default new Router({
    mode: 'history', // https://router.vuejs.org/api/#mode
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [

        {
            path: '/',
            redirect: '/dashboard',
            name: 'Home',
            component: TheContainer_Project,
            children: [

                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: Dashboard
                },


                {
                    path: 'correspondence',
                    name: 'Correspondence',
                    component: Correspondence
                },

                {
                    path: 'competencies',
                    name: 'Competencies',
                    component: Competencies
                },

                {
                    path: 'documents',
                    name: 'Documents',
                    component: Documents
                },
                {
                    path: 'documents/create',
                    name: 'CreateDocument',
                    component: CreateDocument
                },

                {
                    path: 'administrator',
                    name: 'administrator',
                    component: Administrator
                },
                {
                    path: 'administration/form',
                    name: 'AdministrationForm',
                    component: AdminForm
                },
            ]
        }
    ]
})
