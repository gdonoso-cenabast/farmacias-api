import sql from 'mssql';
import { DAO } from '../dao';
import { parseProcedureResult } from '../helpers/dao.helper';
import {
    procesarRegistroInventarios,
    procesarEdicionInventarios,
    procesarEliminacionInventarios,
    procesarConsultaInventarios
} from '../helpers/inventarios.helper';

const databaseName: string = String(process.env.DATABASE_API_FARMACIAS ?? 'CBT_API_FARMACIAS').trim();

const dao: DAO = new DAO(databaseName);

export class InventariosService {

    static async registrar(inventarios: any[], usuarioResponsable: string = 'SISTEMA', identificadorFarmacia: number = 0): Promise<Record<string, any>> {

        if (!inventarios || inventarios.length === 0) { throw new Error('[InventariosService.registrar] Debe enviar los datos de al menos un inventario.'); }

        const { validPayload, omittedRecords } = procesarRegistroInventarios(inventarios);

        if (validPayload.length === 0) {

            return {
                total_enviados: inventarios.length,
                total_procesados: 0,
                cantidad_remedios_registrados: 0,
                cantidad_remedios_editados: 0,
                cantidad_remedios_eliminados: 0,
                errores: omittedRecords
            };
        }

        await dao.executeProcedure('dbo.proc_RegistrarInventarios', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(validPayload) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        const output: Record<string, any> = {
            total_enviados: inventarios.length,
            total_procesados: validPayload.length,
            cantidad_remedios_registrados: validPayload.length,
            cantidad_remedios_editados: 0,
            cantidad_remedios_eliminados: 0
        };

        if (omittedRecords.length > 0) { output.errores = omittedRecords; }

        return output;
    }

    static async editar(inventarios: any[], usuarioResponsable: string = 'SISTEMA', identificadorFarmacia: number = 0): Promise<Record<string, any>> {

        if (!inventarios || inventarios.length === 0) { throw new Error('[InventariosService.editar] Debe enviar al menos un inventario para editar.'); }

        const validPayload: any[] = procesarEdicionInventarios(inventarios);

        if (validPayload.length === 0) { throw new Error('[InventariosService.editar] Ninguno de los registros a editar posee datos de identificación válidos.'); }

        await dao.executeProcedure('dbo.proc_EditarInventarios', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(validPayload) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        return {
            total_enviados: inventarios.length,
            total_procesados: validPayload.length,
            cantidad_remedios_registrados: 0,
            cantidad_remedios_editados: validPayload.length,
            cantidad_remedios_eliminados: 0
        };
    }

    static async eliminar(inventarios: any[], usuarioResponsable: string = 'SISTEMA', identificadorFarmacia: number = 0): Promise<Record<string, any>> {

        if (!inventarios || inventarios.length === 0) { throw new Error('[InventariosService.eliminar] Debe especificar al menos un identificador de inventario a eliminar.'); }

        const payload: any[] = procesarEliminacionInventarios(inventarios);

        await dao.executeProcedure('dbo.proc_EliminarInventarios', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(payload) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        return {
            total_enviados: inventarios.length,
            total_procesados: payload.length,
            cantidad_remedios_registrados: 0,
            cantidad_remedios_editados: 0,
            cantidad_remedios_eliminados: payload.length
        };
    }

    static async consultar(identificadorFarmacia?: number | null, inventarios?: any[]): Promise<any[]> {

        const jsonPayload: string | null = procesarConsultaInventarios(inventarios ?? []);

        const procedureResult: any = await dao.executeProcedure('dbo.proc_ConsultarInventarios', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: jsonPayload }
        });

        const parsedResult: any = parseProcedureResult(procedureResult);

        if (!parsedResult || !Array.isArray(parsedResult)) { return []; }

        return parsedResult;
    }
}
