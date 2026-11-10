import swaggerSpec from './swagger.json';
import { getEnvironment } from '../helpers/config.helper';

function resolveSwaggerServers(): any[] {

    const environment: string = getEnvironment();

    const serverUrl: string = environment === 'production' ? '/farmacias-api' : '/';

    const serverDescription: string = environment === 'production' ? 'Servidor API Web CENABAST (Producción)' : 'Servidor Local (Desarrollo)';

    return [{ url: serverUrl, description: serverDescription }];
}

function buildSwaggerDocument(): Record<string, any> {

    const clonedDocument: Record<string, any> = JSON.parse(JSON.stringify(swaggerSpec));

    clonedDocument.servers = resolveSwaggerServers();

    return clonedDocument;
}

export const swaggerDocument: Record<string, any> = buildSwaggerDocument();
