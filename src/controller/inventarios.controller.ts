import { Request, Response } from 'express';
import { InventariosService } from '../services/inventarios.service';
import { extractIdentifiers, extractPayloadList } from '../helpers/request.helper';

function resolverItemsInventario(request: Request, parametroIdentificador: number): any[] {

    if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { return [{ identificador: parametroIdentificador }]; }

    if (Array.isArray(request.body) && request.body.length > 0) { return request.body; }

    const identificadoresExtraidos: number[] = extractIdentifiers(request);

    const items: any[] = [];

    for (const identificador of identificadoresExtraidos) {

        items.push({ identificador: identificador });
    }

    return items;
}

function extraerCriteriosInventario(body: any): any[] {

    if (!Array.isArray(body) || body.length === 0) { return []; }

    const items: any[] = [];

    for (const elemento of body) {

        if (typeof elemento === 'object' && elemento !== null) {

            const identificador: number = Number(elemento.identificador ?? elemento.id);

            const identificadorSucursal: number = Number(elemento.identificador_sucursal ?? elemento.id_sucursal ?? elemento.id_local);

            const identificadorRemedio: number = Number(elemento.identificador_remedio ?? elemento.id_remedio ?? elemento.id_medicamento);

            const tieneCriterioValido: boolean = (!Number.isNaN(identificador) && identificador > 0) || (!Number.isNaN(identificadorSucursal) && identificadorSucursal > 0) || (!Number.isNaN(identificadorRemedio) && identificadorRemedio > 0);

            if (tieneCriterioValido) { items.push(elemento); }

            continue;
        }

        const idDirecto: number = Number(elemento);

        if (!Number.isNaN(idDirecto) && idDirecto > 0) { items.push({ identificador: idDirecto }); }
    }

    return items;
}

export async function registrarInventarios(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        const itemsInventarios: any[] = extractPayloadList(request, 'inventarios');

        if (itemsInventarios.length === 0) { return response.status(400).json({ error: 'Debe enviar los datos de al menos un inventario.' }); }

        const resultadoRegistro: Record<string, any> = await InventariosService.registrar(itemsInventarios, usuarioResponsable, identificadorFarmacia);

        const codigoEstado: number = resultadoRegistro.total_procesados > 0 ? 200 : 400;

        return response.status(codigoEstado).json({
            mensaje: `Se procesaron ${resultadoRegistro.total_procesados} de ${resultadoRegistro.total_enviados} inventario(s) exitosamente.`,
            ...resultadoRegistro
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error interno al registrar inventarios.' });
    }
}

export async function editarInventarios(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const parametroIdentificador: number = Number(request.params.id);

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        let itemsInventarios: any[] = extractPayloadList(request, 'inventarios');

        if (parametroIdentificador && !Number.isNaN(parametroIdentificador)) { itemsInventarios = [{ ...request.body, identificador: parametroIdentificador }]; }

        if (itemsInventarios.length === 0) { return response.status(400).json({ error: 'Debe especificar el identificador o par (sucursal, remedio) de inventario a editar.' }); }

        const resultadoEdicion: Record<string, any> = await InventariosService.editar(itemsInventarios, usuarioResponsable, identificadorFarmacia);

        return response.status(200).json({
            mensaje: `Se editaron ${resultadoEdicion.cantidad_remedios_editados} remedio(s) correctamente.`,
            ...resultadoEdicion
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error interno al editar inventarios.' });
    }
}

export async function eliminarInventarios(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const parametroIdentificador: number = Number(request.params.id);

        const usuarioResponsable: string = String((request as any).user?.nombre || (request as any).user?.rut || 'SISTEMA');

        const itemsInventarios: any[] = resolverItemsInventario(request, parametroIdentificador);

        if (itemsInventarios.length === 0) { return response.status(400).json({ error: 'Debe especificar el o los registros de inventario a eliminar.' }); }

        const resultadoEliminacion: Record<string, any> = await InventariosService.eliminar(itemsInventarios, usuarioResponsable, identificadorFarmacia);

        return response.status(200).json({
            mensaje: `Se eliminaron ${resultadoEliminacion.cantidad_remedios_eliminados} registro(s) de remedio exitosamente (desactivación lógica).`,
            ...resultadoEliminacion
        });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error al eliminar inventario(s).' });
    }
}

export async function consultarInventarios(request: Request, response: Response): Promise<Response> {

    try {

        const identificadorFarmacia: number = Number((request as any).user?.identificador_farmacia ?? 0);

        const filtroFarmacia: number | null = identificadorFarmacia > 0 ? identificadorFarmacia : null;

        if (request.method === 'GET') {

            const todosLosInventarios: any[] = await InventariosService.consultar(filtroFarmacia);

            return response.status(200).json({ total: todosLosInventarios.length, inventarios: todosLosInventarios });
        }

        const itemsInventarios: any[] = extraerCriteriosInventario(request.body);

        if (itemsInventarios.length === 0) { return response.status(400).json({ error: 'Debe especificar criterios válidos de consulta.' }); }

        const listaInventarios: any[] = await InventariosService.consultar(filtroFarmacia, itemsInventarios);

        return response.status(200).json({ total: listaInventarios.length, inventarios: listaInventarios });

    } catch (error: any) {

        return response.status(500).json({ error: error.message || 'Error al consultar inventarios.' });
    }
}
