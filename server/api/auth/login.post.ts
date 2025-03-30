import { LoginFormDataSchema } from "~/common/schemas";

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, LoginFormDataSchema.parse);
    const admin_users = runtimeConfig.auth.user.split(',');
    if(admin_users.includes(email) && runtimeConfig.auth.pass == password) {
        await setUserSession(event, {
            user: {
                name: 'Sample User',
                email: email,
            }
        })
    } else {
        throw createError({
            statusCode: 401,
            message: 'Bad credentials',
        })
    }
});