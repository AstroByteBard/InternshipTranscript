import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer_Project = () => import('@/containers/TheContainer_Project')

// project 
const Dashboard = () => import('@/projects/views/administration/Dashboard')
const Login = () => import('@/projects/views/Login')

//administrator
const Administrator = () => import('@/projects/views/administration/Administrator')

//documents
const Documents = () => import('@/projects/views/administration/documents/index')
const CreateDocument = () => import('@/projects/views/administration/documents/CreateDocument')

// competencies
const Competencies = () => import('@/projects/views/administration/Competencies')
const FillForm = () => import('@/projects/views/administration/FillForm')

//correspondence
const Correspondence = () => import('@/projects/views/administration/Correspondence')

Vue.use(Router)

export default new Router({
    mode: 'hash', // Use hash mode to ensure links like /#/fill-form work correctly
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [

        {
            path: '/login',
            name: 'Login',
            component: Login
        },
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
                    path: 'documents/edit/:id',
                    name: 'EditDocument',
                    component: CreateDocument
                },

                {
                    path: 'administrator',
                    name: 'administrator',
                    component: Administrator
                },

            ]
        },
        {
            path: '/fill-form',
            name: 'FillForm',
            component: FillForm
        },
    ]
})
