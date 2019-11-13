import Router, {Callback, RouteOptions} from "router";
import { ServerHttp2Stream, IncomingHttpHeaders } from "http2";
import { URL } from "url";

export interface AdditionalData {
	url: URL
}

export type AppRouterArgs = [ServerHttp2Stream, IncomingHttpHeaders, number, AdditionalData];
export type AppRouter = Router<AppRouterArgs>;
export type AppRouterCallback = Callback<AppRouterArgs>;
export type AppRouteList = [RouteOptions, ...AppRouterCallback[]][]

const router: AppRouter = new Router<AppRouterArgs>({name: '/'});

export default router;