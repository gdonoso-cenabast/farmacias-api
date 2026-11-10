import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response, Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { autenticacionMiddleware } from './middlewares/autenticacion.middleware';
import { handleJsonSyntaxError } from './middlewares/json.middleware';
import { rateLimiter } from './middlewares/rateLimit.middleware';
import { getEnvironment } from './helpers/config.helper';

import { swaggerDocument } from './swagger/swagger.config';

import autenticacionRouter from './routes/autenticacion.routes';
import inventariosRouter from './routes/inventarios.routes';
import remediosRouter from './routes/remedios.routes';
import sucursalesRouter from './routes/sucursales.routes';

dotenv.config({ override: true });

const portNumber: number = Number(process.env.PORT ?? 5608);

const urlBase: string = String(process.env.URL_BASE ?? 'http://localhost').trim();

const allowOrigin: string = String(process.env.ALLOW_ORIGIN ?? '').trim();

function logRequest(request: Request, response: Response, next: NextFunction): void {

    const timestamp: number = Date.now();

    response.on('finish', function logFinish(): void {

        const durationMilliseconds: number = Date.now() - timestamp;

        console.info(`[FARMACIAS-API] [${request.method}] ${request.originalUrl || request.url} - Status: ${response.statusCode} - ${durationMilliseconds} ms`);
    });

    next();
}

function healthCheck(_request: Request, response: Response): void {

    response.status(200).json({
        servicio: 'CENABAST - API Farmacias Adheridas',
        estado: 'ONLINE',
        version: '1.0.0',
        documentacion: '/documentacion',
        fechaHora: new Date().toISOString()
    });
}

function errorHandler(error: any, _request: Request, response: Response, _next: NextFunction): void {

    console.error(`[SERVER ERROR] [${_request.method} ${_request.originalUrl}]:`, error.message || error);

    const status: number = Number(error.status) || 500;

    const message: string = status === 500 ? 'Error interno del servidor.' : error.message;

    response.status(status).json({ error: message, timestamp: new Date().toISOString() });
}

function renderizarSwaggerJson(_request: Request, response: Response): void {

    response.json(swaggerDocument);
}

export class App {

    private readonly app: Application;

    private readonly port: number;

    constructor(port: number = portNumber) {

        this.port = port;

        this.app = express();

        this.app.set('trust proxy', 1);

        this.middlewares();

        this.routes();
    }

    private middlewares(): void {

        this.app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

        this.app.use(cookieParser());

        this.app.use(cors({
            origin: getEnvironment() === 'production' ? (allowOrigin || false) : true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        this.app.use(rateLimiter);

        this.app.use(logRequest);

        this.app.use(express.json({ limit: '50mb' }));

        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

        this.app.use(handleJsonSyntaxError);
    }

    private routes(): void {

        const router: Router = Router();

        router.use('/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            customSiteTitle: 'CENABAST - Documentación API Farmacias',
            swaggerOptions: {
                defaultModelsExpandDepth: -1
            }
        }));

        router.get('/documentacion.json', renderizarSwaggerJson);

        router.get(['/', '/estado'], healthCheck);

        router.use('/autenticacion', autenticacionRouter);

        router.use('/sucursales', autenticacionMiddleware, sucursalesRouter);

        router.use('/remedios', autenticacionMiddleware, remediosRouter);

        router.use('/inventarios', autenticacionMiddleware, inventariosRouter);

        this.app.use('/farmacias-api', router);
        this.app.use('/', router);

        this.app.use(errorHandler);
    }

    async listen(): Promise<void> {

        const port: number = this.port;

        this.app.listen(port, function onListen(): void {

            console.log(`[APP] FARMACIAS-API esperando solicitudes en ${urlBase}:${port}`);

            console.log(`[APP] Environment: ${getEnvironment().toUpperCase()}`);

            console.log(`[APP] Documentación Swagger disponible en: ${urlBase}:${port}/documentacion`);
        });
    }
}
