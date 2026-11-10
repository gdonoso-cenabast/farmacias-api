import { Request, Response } from 'express';
import { RemediosService } from '../services/remedios.service';
import { extractIdentifiers } from '../helpers/request.helper';

function resolverConsultaRemedios(request: Request, parametroIdentificador: number): any[] | undefined {

    if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { return [{ identificador: parametroIdentificador }]; }

    if (Array.isArray(request.body) && request.body.length > 0) { return request.body; }

    const identificadoresExtraidos: number[] = extractIdentifiers(request);

    if (identificadoresExtraidos.length === 0) { return undefined; }

    const items: any[] = [];

    for (const identificador of identificadoresExtraidos) {

        items.push({ identificador: identificador });
    }

    return items;
}

export async function consultarRemedios(request: Request, response: Response): Promise<Response> {

    try {

        const parametroIdentificador: number = Number(request.params.id);

        const itemsRemedios: any[] | undefined = resolverConsultaRemedios(request, parametroIdentificador);

        if (request.method === 'POST' && (!itemsRemedios || itemsRemedios.length === 0)) { return response.status(400).json({ error: 'Debe especificar al menos un identificador de remedio a consultar.' }); }

        const listaRemedios: any[] = await RemediosService.consultar(itemsRemedios);

        return response.status(200).json({
            total: listaRemedios.length,
            remedios: listaRemedios
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error al consultar remedios.' });
    }
}
