import { Request, Response } from 'express';
import { SucursalesService } from '../services/sucursales.service';
import { extractIdentifiers, extractPayloadList } from '../helpers/request.helper';

function resolverItemsSucursales(request: Request, parametroIdentificador: number): any[] {

    if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { return [{ identificador: parametroIdentificador }]; }

    if (Array.isArray(request.body) && request.body.length > 0) { return request.body; }

    const identificadoresExtraidos: number[] = extractIdentifiers(request);

    const items: any[] = [];

    for (const identificador of identificadoresExtraidos) {

        items.push({ identificador: identificador });
    }

    return items;
}

function extraerIdentificadoresSucursales(body: any): any[] {

    if (!Array.isArray(body) || body.length === 0) { return []; }

    const items: any[] = [];

    for (const elemento of body) {

        let identificador: number = 0;

        if (typeof elemento === 'object' && elemento !== null) { identificador = Number(elemento.identificador ?? elemento.id); }

        if (typeof elemento !== 'object') { identificador = Number(elemento); }

        if (!Number.isNaN(identificador) && identificador > 0) { items.push({ identificador: identificador }); }
    }

    return items;
}

export async function registrarSucursales(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmaciaToken: number = Number((request as any).user?.identificador_farmacia ?? 0);

        if (!identificadorFarmaciaToken || identificadorFarmaciaToken <= 0) { return response.status(401).json({ error: 'Token no contiene un identificador de farmacia válido.' }); }

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        const itemsSucursales: any[] = extractPayloadList(request, 'sucursales');

        if (itemsSucursales.length === 0) { return response.status(400).json({ error: 'Debe enviar los datos de al menos una sucursal.' }); }

        const resultadoRegistro: Record<string, any> = await SucursalesService.registrar(itemsSucursales, identificadorFarmaciaToken, usuarioResponsable);

        const codigoEstado: number = resultadoRegistro.total_registrados > 0 ? 201 : 400;

        return response.status(codigoEstado).json({
            mensaje: `Se registraron ${resultadoRegistro.total_registrados} de ${resultadoRegistro.total_enviados} sucursal(es) exitosamente.`,
            ...resultadoRegistro
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error interno al registrar sucursales.' });
    }
}

export async function editarSucursales(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const parametroIdentificador: number = Number(request.params.id);

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        let itemsSucursales: any[] = extractPayloadList(request, 'sucursales');

        if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { itemsSucursales = [{ ...request.body, identificador: parametroIdentificador }]; }

        if (itemsSucursales.length === 0) { return response.status(400).json({ error: 'Debe especificar el identificador de la sucursal a editar.' }); }

        const resultadoEdicion: Record<string, any> = await SucursalesService.editar(itemsSucursales, usuarioResponsable, identificadorFarmacia);

        return response.status(200).json({
            mensaje: `Se editaron ${resultadoEdicion.total_afectados} sucursal(es) correctamente.`,
            ...resultadoEdicion
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error interno al editar sucursales.' });
    }
}

export async function eliminarSucursales(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const parametroIdentificador: number = Number(request.params.id);

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        const itemsSucursales: any[] = resolverItemsSucursales(request, parametroIdentificador);

        if (itemsSucursales.length === 0) { return response.status(400).json({ error: 'Debe especificar el o los identificadores de sucursal a eliminar.' }); }

        const resultadoEliminacion: Record<string, any> = await SucursalesService.eliminar(itemsSucursales, usuarioResponsable, identificadorFarmacia);

        return response.status(200).json({
            mensaje: `Se eliminaron ${resultadoEliminacion.total_eliminados} sucursal(es) exitosamente (desactivación lógica).`,
            ...resultadoEliminacion
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error al eliminar sucursal(es).' });
    }
}

export async function consultarSucursales(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const filtroFarmacia: number | null = identificadorFarmacia > 0 ? identificadorFarmacia : null;

        if (request.method === 'GET') {

            const todasLasSucursales: any[] = await SucursalesService.consultar(filtroFarmacia);

            return response.status(200).json({
                total: todasLasSucursales.length,
                sucursales: todasLasSucursales
            });
        }

        const itemsSucursales: any[] = extraerIdentificadoresSucursales(request.body);

        if (itemsSucursales.length === 0) { return response.status(400).json({ error: 'Debe enviar un arreglo con al menos un identificador de sucursal válido.' }); }

        const listaSucursales: any[] = await SucursalesService.consultar(filtroFarmacia, itemsSucursales);

        return response.status(200).json({
            total: listaSucursales.length,
            sucursales: listaSucursales
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error al consultar sucursales.' });
    }
}
