import { Router } from 'express';
import {
    registrarInventarios,
    editarInventarios,
    eliminarInventarios,
    consultarInventarios
} from '../controller/inventarios.controller';
import { requireJsonBody } from '../middlewares/json.middleware';

const router: Router = Router();

router.post('/registrar', requireJsonBody, registrarInventarios);

router.put(['/editar', '/editar/:id'], requireJsonBody, editarInventarios);

router.delete(['/eliminar', '/eliminar/:id'], eliminarInventarios);

router.get('/consultar', consultarInventarios);

router.post('/consultar', requireJsonBody, consultarInventarios);

export default router;
