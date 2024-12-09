import type { EventHandlerRequest, H3Event } from 'h3';
import StatusCode from '~/utils/StatusCode';

export default async function (event: H3Event<EventHandlerRequest>) {
    const runtimeConfig = useRuntimeConfig(event);
    const _session = await requireUserSession(event);

    if (runtimeConfig.debugMode) {
        return;
    }

    if (!_session.user) {
        throw createError({
            statusCode: StatusCode.FORBIDDEN,
            statusMessage: 'User not authenticated.',
        });
    }
}
