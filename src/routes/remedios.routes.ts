import { Router } from 'express';
import { consultarRemedios } from '../controller/remedios.controller';

const router: Router = Router();

router.get(['/', '/consultar', '/:id', '/consultar/:id'], consultarRemedios);

router.post(['/', '/consultar'], consultarRemedios);

export default router;
