import { Router } from 'express';
import { autenticarFarmacia } from '../controller/autenticacion.controller';
import { requireJsonBody } from '../middlewares/json.middleware';

const router: Router = Router();

router.post('/', requireJsonBody, autenticarFarmacia);

export default router;
