import { Request } from 'express';

export function extractPayloadList<T = any>(request: Request, alternativeKey?: string): T[] {

    const requestBody: any = request.body;

    if (!requestBody) { return []; }

    if (Array.isArray(requestBody)) { return requestBody; }

    if (alternativeKey && Array.isArray(requestBody[alternativeKey])) { return requestBody[alternativeKey]; }

    if (typeof requestBody === 'object' && Object.keys(requestBody).length > 0) { return [requestBody as T]; }

    return [];
}

export function extractIdentifiers(request: Request): number[] {

    const parametroIdentificador: number = Number(request.params.id);

    if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { return [parametroIdentificador]; }

    if (Array.isArray(request.body)) {

        const identificadoresCuerpo: number[] = [];

        for (const item of request.body) {

            const valorNumerico: number = Number(item?.identificador ?? item?.id);

            if (!Number.isNaN(valorNumerico) && valorNumerico > 0) {

                identificadoresCuerpo.push(valorNumerico);
            }
        }

        if (identificadoresCuerpo.length > 0) { return identificadoresCuerpo; }
    }

    if (Array.isArray(request.body?.ids)) {

        const identificadoresIds: number[] = [];

        for (const item of request.body.ids) {

            const valorNumerico: number = Number(item);

            if (!Number.isNaN(valorNumerico) && valorNumerico > 0) {

                identificadoresIds.push(valorNumerico);
            }
        }

        return identificadoresIds;
    }

    if (request.query.ids) {

        const identificadoresQuery: number[] = [];

        const listaCadenas: string[] = String(request.query.ids).split(',');

        for (const elemento of listaCadenas) {

            const valorNumerico: number = Number(elemento.trim());

            if (!Number.isNaN(valorNumerico) && valorNumerico > 0) {

                identificadoresQuery.push(valorNumerico);
            }
        }

        return identificadoresQuery;
    }

    if (request.query.id) {

        const identificadorConsulta: number = Number(request.query.id);

        if (!Number.isNaN(identificadorConsulta) && identificadorConsulta > 0) { return [identificadorConsulta]; }
    }

    if (request.body?.identificador) {

        const identificadorCuerpo: number = Number(request.body.identificador);

        if (!Number.isNaN(identificadorCuerpo) && identificadorCuerpo > 0) { return [identificadorCuerpo]; }
    }

    return [];
}
