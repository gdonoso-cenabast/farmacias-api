import { NextFunction, Request, Response } from 'express';

export function handleJsonSyntaxError(error: any, request: Request, response: Response, next: NextFunction): void {

    if (error instanceof SyntaxError && 'body' in error) {

        response.status(400).json({ error: 'El cuerpo de la solicitud contiene un JSON mal formado o con errores de sintaxis.' });

        return;
    }

    next(error);
}

export function requireJsonBody(request: Request, response: Response, next: NextFunction): void {

    if (request.method === 'POST' || request.method === 'PUT') {

        const requestBody: any = request.body;

        if (requestBody === undefined || requestBody === null || (typeof requestBody === 'object' && Object.keys(requestBody).length === 0)) {

            response.status(400).json({ error: 'El cuerpo de la solicitud es requerido y debe contener datos en formato JSON.' });

            return;
        }
    }

    next();
}
