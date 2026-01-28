import { Router } from 'express';
import { PatientController } from '@api/controllers/PatientController';
import { PatientService } from '@domain/services/PatientService';
import { validateBody } from '@api/middleware/validation';
import { asyncHandler } from '@api/middleware/errorHandler';
import { CreatePatientDto } from '@api/dto/CreatePatientDto';
import { getDataSource } from '@infrastructure/config/database';
import { TypeORMPatientRepository } from '@infrastructure/persistence/repositories/TypeORMPatientRepository';

/**
 * Patient routes
 * 
 * Wires up dependencies and registers HTTP endpoints.
 */

const router = Router();

// Dependency injection - create service with repository
const createController = async (): Promise<PatientController> => {
  const dataSource = await getDataSource();
  const repository = new TypeORMPatientRepository(dataSource);
  const service = new PatientService(repository);
  return new PatientController(service);
};

// GET /patients/search - must be before /:id to avoid route conflicts
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.search(req, res);
  })
);

// POST /patients
router.post(
  '/',
  validateBody(CreatePatientDto),
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.create(req, res);
  })
);

// GET /patients
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.list(req, res);
  })
);

// GET /patients/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.getById(req, res);
  })
);

// PUT /patients/:id
router.put(
  '/:id',
  validateBody(CreatePatientDto),
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.update(req, res);
  })
);

// DELETE /patients/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const controller = await createController();
    await controller.delete(req, res);
  })
);

export default router;
