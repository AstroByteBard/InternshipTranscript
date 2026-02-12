import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer_Project = () => import('@/containers/TheContainer_Project')


// project 
const Dashboard = () => import('@/projects/views/Dashboard')
const Login = () => import('@/projects/views/Login')

//administrator
const Student = () => import('@/projects/views/administrator/Student')

// competencies
const general = () => import('@/projects/views/competencies/General/index')
const GeneralDetail = () => import('@/projects/views/competencies/General/Detail')
const specific = () => import('@/projects/views/competencies/Specific/index')
const SpecificDetail = () => import('@/projects/views/competencies/Specific/Detail')
const suggestions = () => import('@/projects/views/competencies/Suggestions/index')
const SuggestionDetail = () => import('@/projects/views/competencies/Suggestions/Detail')

//correspondence
const Email_advisors = () => import('@/projects/views/correspondence/Advisors')
const Email_student = () => import('@/projects/views/correspondence/Student')


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
                    redirect: '/correspondence/advisors',
                    name: 'Correspondence',
                    component: {
                        render(c) {
                            return c('router-view')
                        }
                    },
                    children: [
                        {
                            path: 'advisors',
                            name: 'Advisors',
                            component: Email_advisors
                        },
                        {
                            path: 'student',
                            name: 'Student',
                            component: Email_student
                        }
                    ]
                },

                {
                    path: 'competencies',
                    redirect: '/competencies/general',
                    name: 'Competencies',
                    component: {
                        render(c) {
                            return c('router-view')
                        }
                    },
                    children: [
                        {
                            path: 'general',
                            name: 'General',
                            component: general
                        },
                        {
                            path: 'general/:id',
                            name: 'GeneralDetail',
                            component: GeneralDetail
                        },
                        {
                            path: 'specific',
                            name: 'Specific',
                            component: specific
                        },
                        {
                            path: 'specific/:id',
                            name: 'SpecificDetail',
                            component: SpecificDetail
                        },
                        {
                            path: 'suggestions',
                            name: 'Suggestions',
                            component: suggestions
                        },
                        {
                            path: 'suggestions/:id',
                            name: 'SuggestionDetail',
                            component: SuggestionDetail
                        }
                    ]
                },

                {
                    path: 'administrator',
                    redirect: '/administrator/student',
                    name: 'administrator',
                    component: {
                        render(c) {
                            return c('router-view')
                        }
                    },
                    children: [
                        {
                            path: 'student',
                            name: 'Student',
                            component: Student
                        }
                    ]
                },
            ]
        }
    ]
})
