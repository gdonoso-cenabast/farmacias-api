import { Router } from 'express';
import {
    registrarSucursales,
    editarSucursales,
    eliminarSucursales,
    consultarSucursales
} from '../controller/sucursales.controller';
import { requireJsonBody } from '../middlewares/json.middleware';

const router: Router = Router();

router.post('/registrar', requireJsonBody, registrarSucursales);

router.put(['/editar', '/editar/:id'], requireJsonBody, editarSucursales);

router.delete(['/eliminar', '/eliminar/:id'], eliminarSucursales);

router.get('/consultar', consultarSucursales);

router.post('/consultar', requireJsonBody, consultarSucursales);

export default router;
