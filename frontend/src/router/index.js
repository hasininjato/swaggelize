import { createWebHistory, createRouter } from 'vue-router'

import { useAuthStore } from "../store/auth.store";


// on a grown project, we need to separate routes for better clarity
// we use lazy loading for better performance on loading components
const routes = [
    // we use Mainlayout component as parent
    {
        path: '/',
        component: import("../layouts/MainLayout.vue"),
        children: [
            {
                path: '',
                component: import("../views/Home.vue"),
                name: 'Home'
            },
            {
                path: 'user/info',
                component: import("../views/UserInfo.vue"),
                name: 'UserInfo'
            }
        ]
    },
    {
        path: '/transaction',
        component: import("../layouts/MainLayout.vue"),
        children: [
            {
                path: 'list',
                component: import("../views/transaction/TransactionList.vue"),
                name: 'TransactionList'
            },
            {
                path: 'create',
                component: import("../views/transaction/TransactionCreate.vue"),
                name: 'TransactionCreate'
            }
        ]
    },
    { path: '/login', component: import("../views/authentication/Login.vue"), name: "login" },
    { path: '/register', component: import("../views/authentication/Register.vue"), name: "register" },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    // wee protect routes, make some publics and some only accessed by authenticated user
    document.title = 'Sample app test';
    const userLocalStorage = JSON.parse(localStorage.getItem('user'));
    const authStore = useAuthStore();
    if (userLocalStorage) {
        // we need to check first if the access token is not yet expired
        const isValid = await authStore.validateToken()
        if (!isValid) {
            localStorage.removeItem('user');
            return next("/login");
        }
    }
    if (to.name == "login" || to.name == "register") {
        if (userLocalStorage) {
            return next("/");
        }
        next();
    } else {
        if (userLocalStorage == null) {
            return next("/login");
        }
        next();
    }
});

export default router;