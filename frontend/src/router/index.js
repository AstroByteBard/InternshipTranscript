import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer_Project = () => import('@/containers/TheContainer_Project')
const TheContainer_Student = () => import('@/containers/TheContainer_Student')

// project 
const Dashboard = () => import('@/projects/views/administration/Dashboard')
const StudentDashboard = () => import('@/projects/views/student/StudentDashboard')
const Login = () => import('@/projects/views/Login')

//administrator
const AdministratorStudent = () => import('@/projects/views/administration/Administrator/Student')
const AdministratorAdviser = () => import('@/projects/views/administration/Administrator/Adviser')

//documents
const Documents = () => import('@/projects/views/administration/documents/index')
const CreateDocument = () => import('@/projects/views/administration/documents/CreateDocument')

// competencies
const CompetenciesSoftskill = () => import('@/projects/views/administration/Competencies/Softskill')
const CompetenciesHardskill = () => import('@/projects/views/administration/Competencies/Hardskill')
const CompetenciesSuggestions = () => import('@/projects/views/administration/Competencies/Suggestions')
const FillForm = () => import('@/projects/views/administration/FillForm')

//correspondence
const CorrespondenceStudent = () => import('@/projects/views/administration/Correspondence/Student')
const CorrespondenceAdviser = () => import('@/projects/views/administration/Correspondence/Adviser')

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
            path: '/student',
            redirect: '/student/dashboard',
            name: 'StudentHome',
            component: TheContainer_Student,
            children: [
                {
                    path: 'dashboard',
                    name: 'StudentDashboard',
                    component: StudentDashboard
                }
            ]
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
                    redirect: 'correspondence/student'
                },
                {
                    path: 'Correspondence/student',
                    name: 'CorrespondenceStudent',
                    component: CorrespondenceStudent
                },
                {
                    path: 'Correspondence/adviser',
                    name: 'CorrespondenceAdviser',
                    component: CorrespondenceAdviser
                },

                {
                    path: 'Competencies',
                    redirect: 'Competencies/softskill'
                },
                {
                    path: 'Competencies/softskill',
                    name: 'CompetenciesSoftskill',
                    component: CompetenciesSoftskill
                },
                {
                    path: 'Competencies/hardskill',
                    name: 'CompetenciesHardskill',
                    component: CompetenciesHardskill
                },
                {
                    path: 'Competencies/suggestions',
                    name: 'CompetenciesSuggestions',
                    component: CompetenciesSuggestions
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
                    redirect: 'administrator/student'
                },
                {
                    path: 'administrator/student',
                    name: 'AdministratorStudent',
                    component: AdministratorStudent
                },
                {
                    path: 'administrator/adviser',
                    name: 'AdministratorAdviser',
                    component: AdministratorAdviser
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
