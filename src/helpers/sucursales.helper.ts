export function procesarRegistroSucursales(sucursales: any[], identificadorFarmaciaToken: number): { validPayload: any[]; omittedRecords: any[] } {

    const validPayload: any[] = [];

    const omittedRecords: any[] = [];

    for (const sucursal of sucursales) {

        const nombreSucursal: string = String(sucursal?.nombre ?? '').trim();

        if (!nombreSucursal) {

            omittedRecords.push({
                registro: sucursal,
                motivo: 'El campo nombre es obligatorio.'
            });

            continue;
        }

        validPayload.push({
            identificador_farmacia: identificadorFarmaciaToken,
            nombre: nombreSucursal,
            direccion: sucursal.direccion ? String(sucursal.direccion).trim() : null,
            comuna: sucursal.comuna ? String(sucursal.comuna).trim() : null,
            region: sucursal.region ? String(sucursal.region).trim() : null,
            telefono: sucursal.telefono ? String(sucursal.telefono).trim() : null,
            correo_electronico: sucursal.correo_electronico ? String(sucursal.correo_electronico).trim() : null,
            latitud: sucursal.latitud !== undefined && sucursal.latitud !== null ? String(sucursal.latitud).trim() : null,
            longitud: sucursal.longitud !== undefined && sucursal.longitud !== null ? String(sucursal.longitud).trim() : null
        });
    }

    return { validPayload: validPayload, omittedRecords: omittedRecords };
}

export function procesarEdicionSucursales(sucursales: any[]): any[] {

    const sucursalesValidas: any[] = [];

    for (const sucursal of sucursales) {

        const identificador: number = Number(sucursal.identificador);

        if (!identificador || Number.isNaN(identificador)) {

            continue;
        }

        sucursalesValidas.push(sucursal);
    }

    return sucursalesValidas;
}

export function procesarEliminacionSucursales(sucursales: any[]): any[] {

    const payload: any[] = [];

    for (const sucursal of sucursales) {

        const id: number = typeof sucursal === 'object' && sucursal !== null ? Number(sucursal.identificador ?? sucursal.id) : Number(sucursal);

        if (id > 0) {

            payload.push({ identificador: id });
        }
    }

    return payload;
}

export function procesarConsultaSucursales(sucursales: any[]): string | null {

    if (!sucursales || sucursales.length === 0) { return null; }

    const payload: any[] = [];

    for (const sucursal of sucursales) {

        const id: number = typeof sucursal === 'object' && sucursal !== null ? Number(sucursal.identificador ?? sucursal.id) : Number(sucursal);

        if (id > 0) {

            payload.push({ identificador: id });
        }
    }

    if (payload.length === 0) { return null; }

    return JSON.stringify(payload);
}
