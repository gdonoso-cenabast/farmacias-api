import sql from 'mssql';
import { DAO } from '../dao';
import { parseProcedureResult } from '../helpers/dao.helper';
import {
    procesarRegistroSucursales,
    procesarEdicionSucursales,
    procesarEliminacionSucursales,
    procesarConsultaSucursales
} from '../helpers/sucursales.helper';

const databaseName: string = String(process.env.DATABASE_API_FARMACIAS ?? 'CBT_API_FARMACIAS').trim();

const dao: DAO = new DAO(databaseName);

export class SucursalesService {

    static async registrar(sucursales: any[], identificadorFarmaciaToken: number = 0, usuarioResponsable: string = 'SISTEMA'): Promise<Record<string, any>> {

        if (!sucursales || sucursales.length === 0) { throw new Error('[SucursalesService.registrar] Debe enviar los datos de al menos una sucursal.'); }

        const { validPayload, omittedRecords } = procesarRegistroSucursales(sucursales, identificadorFarmaciaToken);

        if (validPayload.length === 0) {

            return {
                total_enviados: sucursales.length,
                total_registrados: 0,
                errores: omittedRecords
            };
        }

        await dao.executeProcedure('dbo.proc_RegistrarSucursales', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmaciaToken || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(validPayload) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        const output: Record<string, any> = {
            total_enviados: sucursales.length,
            total_registrados: validPayload.length
        };

        if (omittedRecords.length > 0) { output.errores = omittedRecords; }

        return output;
    }

    static async editar(sucursales: any[], usuarioResponsable: string = 'SISTEMA', identificadorFarmacia: number = 0): Promise<Record<string, any>> {

        if (!sucursales || sucursales.length === 0) { throw new Error('[SucursalesService.editar] Debe enviar al menos una sucursal para editar.'); }

        const sucursalesValidas: any[] = procesarEdicionSucursales(sucursales);

        if (sucursalesValidas.length === 0) { throw new Error('[SucursalesService.editar] Ninguno de los registros a editar posee un identificador válido.'); }

        await dao.executeProcedure('dbo.proc_EditarSucursales', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(sucursalesValidas) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        return {
            total_afectados: sucursalesValidas.length
        };
    }

    static async eliminar(sucursales: any[], usuarioResponsable: string = 'SISTEMA', identificadorFarmacia: number = 0): Promise<Record<string, any>> {

        if (!sucursales || sucursales.length === 0) { throw new Error('[SucursalesService.eliminar] Debe especificar al menos un identificador de sucursal a eliminar.'); }

        const payload: any[] = procesarEliminacionSucursales(sucursales);

        await dao.executeProcedure('dbo.proc_EliminarSucursales', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(payload) },
            usuario_responsable: { type: sql.VarChar(255), value: usuarioResponsable }
        });

        return {
            total_eliminados: payload.length
        };
    }

    static async consultar(identificadorFarmacia?: number | null, sucursales?: any[]): Promise<any[]> {

        const jsonPayload: string | null = procesarConsultaSucursales(sucursales ?? []);

        const procedureResult: any = await dao.executeProcedure('dbo.proc_ConsultarSucursales', {
            identificador_farmacia: { type: sql.Int, value: identificadorFarmacia || null },
            cadena_json: { type: sql.NVarChar(sql.MAX), value: jsonPayload }
        });

        const parsedResult: any = parseProcedureResult(procedureResult);

        if (!parsedResult || !Array.isArray(parsedResult)) { return []; }

        return parsedResult;
    }
}
