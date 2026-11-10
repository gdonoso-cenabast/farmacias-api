export function parseProcedureResult(procedureResult: any): any {

    const jsonString: string = String(procedureResult?.recordset?.[0]?.resultado_json ?? '').trim();

    if (jsonString === '') { return null; }

    try {

        return JSON.parse(jsonString);

    } catch {

        return null;
    }
}
