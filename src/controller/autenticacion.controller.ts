import { Request, Response } from 'express';
import { AutenticacionService } from '../services/autenticacion.service';
import { validarRutNumerico } from '../helpers/autenticacion.helper';

export async function autenticarFarmacia(request: Request, response: Response): Promise<Response> {

    const numeroRut: number = validarRutNumerico(request.body.rut);

    const contrasenia: string = String(request.body.contrasenia ?? request.body.password ?? '').trim();

    if (!numeroRut || !contrasenia) { return response.status(401).json({ error: 'No autorizado.' }); }

    try {

        const resultadoAutenticacion: Record<string, any> = await AutenticacionService.autenticarFarmacia(numeroRut, contrasenia);

        return response.status(200).json(resultadoAutenticacion);

    } catch (error: any) {

        return response.status(401).json({ error: 'No autorizado.' });
    }
}
