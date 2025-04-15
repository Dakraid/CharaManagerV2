export default function validateIdRouteParameter(route: RouteLocationNormalizedLoadedGeneric) {
    return route.params.id && !isNaN(Number(route.params.id));
}
