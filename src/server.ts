import dotenv from 'dotenv';
import { App } from './app';
import { validateEnvironmentVariables } from './helpers/config.helper';

dotenv.config();

validateEnvironmentVariables();

function registerProcessHandlers(): void {

    process.on('uncaughtException', function onUncaughtException(error: Error): void {

        console.error(`[PROCESS ERROR] Excepción no controlada: ${error.message || error}`);
    });

    process.on('unhandledRejection', function onUnhandledRejection(reason: any): void {

        console.error(`[PROCESS ERROR] Rechazo de promesa no controlado: ${reason?.message || reason}`);
    });
}

registerProcessHandlers();

const server: App = new App();

server.listen();
