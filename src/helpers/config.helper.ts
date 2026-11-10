export function getEnvironment(): string {

    const developmentEnvironment: string = String(process.env.DEVELOPMENT_ENVIRONMENT ?? '').trim().toLowerCase();

    if (developmentEnvironment === 'true') { return 'development'; }

    return 'production';
}

export function validateEnvironmentVariables(): void {

    const requiredVariables: string[] = ['PORT', 'DATABASE_SERVER', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_API_FARMACIAS', 'JWT_SECRET'];

    for (const variableName of requiredVariables) {

        const variableValue: string = String(process.env[variableName] ?? '').trim();

        if (variableValue === '') {

            console.error(`[CONFIG ERROR] Variable de entorno requerida no encontrada o vacía: ${variableName}`);

            process.exit(1);
        }
    }
}
