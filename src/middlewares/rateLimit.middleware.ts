import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

function skipOptions(request: Request): boolean { return request.method === 'OPTIONS'; }

function limitHandler(request: Request, response: Response): void {

    console.warn(`[RATE LIMIT] Límite de solicitudes superado desde IP: ${request.ip}`);

    response.status(429).json({ error: 'Demasiadas solicitudes enviadas. Por favor espere unos momentos antes de reintentar.', code: 'RATE_LIMIT_EXCEEDED' });
}

export const rateLimiter: any = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipOptions,
    handler: limitHandler
});
