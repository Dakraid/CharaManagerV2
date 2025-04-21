import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router';

export default function validateIdRouteParameter(route: RouteLocationNormalizedLoadedGeneric) {
    return route.params.id && !Array.isArray(route.params.id) && !isNaN(Number(route.params.id));
}
