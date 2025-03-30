import { LoginFormDataSchema } from "~/common/schemas";

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, LoginFormDataSchema.parse);
    console.log(email, password)
    if(runtimeConfig.auth.user == email && runtimeConfig.auth.pass == password) {
        await setUserSession(event, {
            user: {
                name: 'Sample User'
            }
        })
    } else {
        throw createError({
            statusCode: 401,
            message: 'Bad credentials',
        })
    }
});