import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const jwtSecret: string = String(process.env.JWT_SECRET).trim();

const jwtExpiration: string = String(process.env.JWT_EXPIRATION).trim();

export function generateToken(numeroRut: number, identificadorFarmacia: number = 0, nombreFarmacia: string = ''): string {

    const payload: Record<string, any> = {
        rut: numeroRut,
        identificador_farmacia: identificadorFarmacia,
        nombre: nombreFarmacia,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration, algorithm: 'HS256' } as any);
}

export function verifyToken(token: string): any {

    try {

        return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] } as any);

    } catch (error: unknown) {

        throw new Error('Token inválido o expirado.');
    }
}

export function extractToken(authorizationHeader: string | undefined): string | null {

    if (!authorizationHeader) { return null; }

    const authorizationParts: string[] = authorizationHeader.split(' ');

    if (authorizationParts.length !== 2 || authorizationParts[0].toLowerCase() !== 'bearer') { return null; }

    const tokenValue: string = authorizationParts[1].trim();

    if (tokenValue === '') { return null; }

    return tokenValue;
}

export function validarRutNumerico(rutInput: any): number {

    const numeroRut: number = Number(rutInput);

    if (!Number.isInteger(numeroRut) || numeroRut < 10000000 || numeroRut > 99999999) { return 0; }

    return numeroRut;
}

export function compareContrasenia(plainTextContrasenia: string, storedHashContrasenia: string): boolean {

    if (!plainTextContrasenia || !storedHashContrasenia) { return false; }

    if (storedHashContrasenia.startsWith('$2')) {

        try {

            return bcrypt.compareSync(plainTextContrasenia, storedHashContrasenia);

        } catch (error: unknown) {

            console.error('Error al verificar hash bcrypt:', error);

            return false;
        }
    }

    const sha256Hash: string = crypto
        .createHash('sha256')
        .update(plainTextContrasenia)
        .digest('hex');

    return sha256Hash.toLowerCase() === storedHashContrasenia.toLowerCase();
}

export function hashContrasenia(plainTextContrasenia: string): string {

    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(plainTextContrasenia, salt);
}
