export function procesarRegistroInventarios(inventarios: any[]): { validPayload: any[]; omittedRecords: any[] } {

    const validPayload: any[] = [];

    const omittedRecords: any[] = [];

    for (const inventario of inventarios) {

        const identificadorSucursal: number = Number(inventario.id_sucursal ?? inventario.identificador_sucursal ?? inventario.id_local);

        const identificadorRemedio: number = Number(inventario.id_remedio ?? inventario.id_medicamento ?? inventario.identificador_remedio ?? inventario.id_producto);

        const cantidad: number = Number(inventario.cantidad ?? inventario.stock ?? inventario.stock_real ?? 0);

        if (!identificadorSucursal || !identificadorRemedio) {

            omittedRecords.push({
                registro: inventario,
                motivo: 'Debe especificar identificador de sucursal e identificador de remedio válidos.'
            });

            continue;
        }

        validPayload.push({
            identificador_sucursal: identificadorSucursal,
            identificador_remedio: identificadorRemedio,
            cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
            lote: inventario.lote ? String(inventario.lote).trim() : null,
            fecha_vencimiento: inventario.fecha_vencimiento ? String(inventario.fecha_vencimiento).trim() : null
        });
    }

    return { validPayload: validPayload, omittedRecords: omittedRecords };
}

export function procesarEdicionInventarios(inventarios: any[]): any[] {

    const validPayload: any[] = [];

    for (const inventario of inventarios) {

        const identificador: number = Number(inventario.identificador);

        const identificadorSucursal: number = Number(inventario.id_sucursal ?? inventario.identificador_sucursal ?? inventario.id_local);

        const identificadorRemedio: number = Number(inventario.id_remedio ?? inventario.id_medicamento ?? inventario.identificador_remedio ?? inventario.id_producto);

        if (!identificador && (!identificadorSucursal || !identificadorRemedio)) {

            continue;
        }

        validPayload.push({
            identificador: identificador > 0 ? identificador : null,
            identificador_sucursal: identificadorSucursal > 0 ? identificadorSucursal : null,
            identificador_remedio: identificadorRemedio > 0 ? identificadorRemedio : null,
            cantidad: inventario.cantidad !== undefined ? Number(inventario.cantidad) : null,
            lote: inventario.lote !== undefined ? (inventario.lote ? String(inventario.lote).trim() : null) : undefined,
            fecha_vencimiento: inventario.fecha_vencimiento !== undefined ? (inventario.fecha_vencimiento ? String(inventario.fecha_vencimiento).trim() : null) : undefined
        });
    }

    return validPayload;
}

export function procesarEliminacionInventarios(inventarios: any[]): any[] {

    const payload: any[] = [];

    for (const inventario of inventarios) {

        if (typeof inventario === 'object' && inventario !== null) {

            payload.push({
                identificador: inventario.identificador ? Number(inventario.identificador) : null,
                identificador_sucursal: inventario.identificador_sucursal ? Number(inventario.identificador_sucursal) : null,
                identificador_remedio: inventario.identificador_remedio ? Number(inventario.identificador_remedio) : null
            });

            continue;
        }

        payload.push({ identificador: Number(inventario) });
    }

    return payload;
}

export function procesarConsultaInventarios(inventarios: any[]): string | null {

    if (!inventarios || inventarios.length === 0) { return null; }

    const payload: any[] = [];

    for (const inventario of inventarios) {

        if (typeof inventario === 'object' && inventario !== null) {

            const identificador: number = Number(inventario.identificador ?? inventario.id);

            const identificadorSucursal: number = Number(inventario.identificador_sucursal ?? inventario.id_sucursal ?? inventario.id_local);

            const identificadorRemedio: number = Number(inventario.identificador_remedio ?? inventario.id_remedio ?? inventario.id_medicamento);

            const tieneId: boolean = !Number.isNaN(identificador) && identificador > 0;

            const tieneSucursal: boolean = !Number.isNaN(identificadorSucursal) && identificadorSucursal > 0;

            const tieneRemedio: boolean = !Number.isNaN(identificadorRemedio) && identificadorRemedio > 0;

            if (tieneId || tieneSucursal || tieneRemedio) {

                payload.push({
                    identificador: tieneId ? identificador : null,
                    identificador_sucursal: tieneSucursal ? identificadorSucursal : null,
                    identificador_remedio: tieneRemedio ? identificadorRemedio : null
                });
            }

            continue;
        }

        const idDirecto: number = Number(inventario);

        if (!Number.isNaN(idDirecto) && idDirecto > 0) { payload.push({ identificador: idDirecto, identificador_sucursal: null, identificador_remedio: null }); }
    }

    if (payload.length === 0) { return null; }

    return JSON.stringify(payload);
}
