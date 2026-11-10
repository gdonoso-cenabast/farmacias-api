import { NextFunction, Request, Response } from 'express';
import { extractToken, verifyToken } from '../helpers/autenticacion.helper';

export function autenticacionMiddleware(request: Request, response: Response, next: NextFunction): void {

    try {

        const token: string | null = extractToken(request.headers.authorization);

        if (!token) {

            response.status(401).json({ error: 'Token Bearer requerido. Debe incluir la cabecera Authorization: Bearer [token]' });

            return;
        }

        const decodedToken: any = verifyToken(token);

        (request as any).user = {
            rut: decodedToken.rut,
            identificador_farmacia: decodedToken.identificador_farmacia,
            nombre: decodedToken.nombre,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        };

        next();

    } catch (error: unknown) {

        response.status(401).json({ error: 'Token inválido o expirado. Inicie sesión nuevamente.' });

        return;
    }
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                rut: number;
                identificador_farmacia?: number;
                nombre?: string;
                iat?: number;
                exp?: number;
            };
        }
    }
}
