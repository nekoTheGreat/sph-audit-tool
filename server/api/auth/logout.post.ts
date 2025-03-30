import { LoginFormDataSchema } from "~/common/schemas";

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    await setUserSession(event, {
        user: undefined,
    });
    return {};
});