import * as HTTP2 from "http2";

import Router, * as RouterNS from "Router";

interface ResponseExtension {
    endAsync(data?: any): Promise<void>;

    endJSON(status: number, headers: {[index:string]: string}, rtn: any): Promise<void>;
    endJSON(status: number, rtn: any): Promise<void>;
    endJSON(rtn: any): Promise<void>;

    endError(err: Error, msg?: string): Promise<void>;
}

export type Request = HTTP2.Http2ServerRequest;
export type Response = HTTP2.Http2ServerResponse & ResponseExtension;

export type AppRouter = Router<Request,Response>;
export type AppMiddleware<ParamsObjectKeys = {}> = RouterNS.MiddlewareFunction<Request,Response,ParamsObjectKeys>;
export type AppMountMiddleware = RouterNS.MountMiddleware<Request,Response>;

export type AppRoutesArray<ParamsObjectKeys = {}> = [RouterNS.RouteOptions,...AppMiddleware<ParamsObjectKeys>[]][];