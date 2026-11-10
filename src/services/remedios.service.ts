import sql from 'mssql';
import { DAO } from '../dao';
import { parseProcedureResult } from '../helpers/dao.helper';

const databaseName: string = String(process.env.DATABASE_API_FARMACIAS ?? 'CBT_API_FARMACIAS').trim();

const dao: DAO = new DAO(databaseName);

function procesarConsultaRemedios(remedios: any[]): string | null {

    if (!remedios || remedios.length === 0) { return null; }

    const payload: any[] = [];

    for (const remedio of remedios) {

        let id: number = 0;

        if (typeof remedio === 'object' && remedio !== null) { id = Number(remedio.identificador ?? remedio.id); }

        if (typeof remedio !== 'object') { id = Number(remedio); }

        if (!Number.isNaN(id) && id > 0) { payload.push({ identificador: id }); }
    }

    if (payload.length === 0) { return null; }

    return JSON.stringify(payload);
}

export class RemediosService {

    static async consultar(remedios?: any[]): Promise<any[]> {

        const jsonPayload: string | null = procesarConsultaRemedios(remedios ?? []);

        const procedureResult: any = await dao.executeProcedure('dbo.proc_ConsultarRemedios', {
            cadena_json: { type: sql.NVarChar(sql.MAX), value: jsonPayload }
        });

        const parsedResult: any = parseProcedureResult(procedureResult);

        if (!parsedResult || !Array.isArray(parsedResult)) { return []; }

        return parsedResult;
    }
}
