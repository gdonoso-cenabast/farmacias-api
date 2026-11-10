import sql from 'mssql';
import { DAO } from '../dao';
import { compareContrasenia, generateToken, hashContrasenia } from '../helpers/autenticacion.helper';

const databaseName: string = String(process.env.DATABASE_API_FARMACIAS ?? 'CBT_API_FARMACIAS').trim();

const dao: DAO = new DAO(databaseName);

export class AutenticacionService {

    static async autenticarFarmacia(numeroRut: number, contrasenia: string): Promise<Record<string, any>> {

        const procedureResult: any = await dao.executeProcedure('dbo.proc_Autenticar', {
            numero_rut: { type: sql.Int, value: numeroRut }
        });

        const jsonString: string = String(procedureResult.recordset?.[0]?.resultado_json ?? '').trim();

        let farmacia: any = null;

        if (jsonString !== '') {

            try { farmacia = JSON.parse(jsonString); } catch { farmacia = null; }
        }

        const hashContraseniaGuardada: string = farmacia?.contrasenia ? String(farmacia.contrasenia).trim() : hashContrasenia('');

        const contraseniaValida: boolean = compareContrasenia(contrasenia, hashContraseniaGuardada);

        if (!farmacia || !contraseniaValida) { throw new Error('No autorizado.'); }

        const token: string = generateToken(
            farmacia.rut,
            farmacia.identificador,
            farmacia.nombre
        );

        return {
            mensaje: 'Autenticación exitosa.',
            token: token,
            tipo_token: 'Bearer',
            expiracion: process.env.JWT_EXPIRATION ?? '24h',
            farmacia: {
                identificador: farmacia.identificador,
                rut: farmacia.rut,
                nombre: farmacia.nombre
            }
        };
    }
}
