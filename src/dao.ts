import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

export class DAO {

    private connectionPool: sql.ConnectionPool | null = null;

    private connectingPromise: Promise<sql.ConnectionPool> | null = null;

    private readonly databaseName: string;

    constructor(databaseName?: string) {

        this.databaseName = databaseName || String(process.env.DATABASE_API_FARMACIAS).trim();
    }

    async connect(databaseName: string): Promise<sql.ConnectionPool> {

        if (!databaseName) { throw new Error('Database name not provided'); }

        if (this.connectionPool?.connected) { return this.connectionPool; }

        if (this.connectingPromise) { return this.connectingPromise; }

        const databaseUser: string = String(process.env.DATABASE_USER).trim();

        const databasePassword: string = String(process.env.DATABASE_PASSWORD).trim();

        const databaseServer: string = String(process.env.DATABASE_SERVER).trim();

        const connectionTimeoutMilliseconds: number = 300000;

        const connectionLimit: number = 20;

        const databaseConfig: sql.config = {
            user: databaseUser,
            password: databasePassword,
            server: databaseServer,
            database: databaseName,
            options: { encrypt: true, trustServerCertificate: true },
            requestTimeout: connectionTimeoutMilliseconds,
            pool: { max: connectionLimit, min: 1, idleTimeoutMillis: 30000 }
        };

        const self: DAO = this;

        this.connectingPromise = new Promise(async function ejecutarConexion(resolve, reject): Promise<void> {

            try {

                const pool: sql.ConnectionPool = new sql.ConnectionPool(databaseConfig);

                pool.on('error', function onPoolError(error: any): void {

                    console.error(`[DAO] Error en el pool de conexión (${databaseName}):`, error.message || error);

                    self.connectionPool = null;
                });

                self.connectionPool = await pool.connect();

                self.connectingPromise = null;

                resolve(self.connectionPool);

            } catch (error: any) {

                self.connectionPool = null;

                self.connectingPromise = null;

                reject(error);
            }
        });

        return this.connectingPromise;
    }

    private prepareRequest(request: sql.Request, parameters: Record<string, any>): void {

        for (const key in parameters) {

            const parameter: any = parameters[key];

            if (parameter && typeof parameter === 'object' && 'type' in parameter && 'value' in parameter) {

                request.input(key, parameter.type, parameter.value);

                continue;
            }

            request.input(key, parameter);
        }
    }

    async executeProcedure(procedure: string, parameters: Record<string, any> = {}): Promise<any> {

        try {

            const pool: sql.ConnectionPool = await this.connect(this.databaseName);

            const request: sql.Request = pool.request();

            this.prepareRequest(request, parameters);

            return await request.execute(procedure);

        } catch (error: any) {

            if (!this.connectionPool?.connected) {

                this.connectionPool = null;
            }

            console.error(`[DAO.executeProcedure: ${procedure}] Error:`, error.message || error);

            throw new Error(`[DAO: ${procedure}] ${error.message || 'Error en procedimiento almacenado.'}`);
        }
    }

    async executeQuery(query: string, parameters: Record<string, any> = {}): Promise<any> {

        try {

            const pool: sql.ConnectionPool = await this.connect(this.databaseName);

            const request: sql.Request = pool.request();

            this.prepareRequest(request, parameters);

            return await request.query(query);

        } catch (error: any) {

            if (!this.connectionPool?.connected) {

                this.connectionPool = null;
            }

            console.error('[DAO.executeQuery] Error:', error.message || error);

            throw new Error(`[DAO.executeQuery] ${error.message || 'Error en consulta SQL.'}`);
        }
    }

    async getPool(): Promise<sql.ConnectionPool> {

        return this.connect(this.databaseName);
    }
}
