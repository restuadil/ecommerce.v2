import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

import { Request, Response } from "express";
import { map, Observable } from "rxjs";

import { BaseResponse, ControllerResponse } from "src/types/web.type";

export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: ControllerResponse<T>) => {
        return {
          statusCode: response.statusCode,
          status: true,
          data: data.data,
          meta: data.meta || undefined,
          message: data.message,
          error: null,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
