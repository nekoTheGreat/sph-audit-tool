export default defineNuxtRouteMiddleware(async (to, from) => {
    const { loggedIn } = await useUserSession();

    if(to.path != '/auth/login' && !loggedIn.value) {
        return navigateTo("/auth/login");
    } else if(to.path == '/auth/login' && loggedIn.value) {
        return navigateTo('/');
    }
})