import { Router, Request, Response } from "express";
import {
  Credential,
  IssuanceResponse,
  ErrorResponse,
} from "../types/credential";
import DatabaseService from "../services/database";
import { getWorkerId } from "../utils/workerId";
import logger from "../utils/logger";

const router = Router();
const db = new DatabaseService(process.env.DATABASE_URL);
const workerId = getWorkerId();

router.post("/issue", async (req: Request, res: Response) => {
  try {
    const credential: Credential = req.body;

    // Validate required fields
    if (!credential.id || !credential.name || !credential.role) {
      logger.warn("Invalid credential data", { body: req.body });
      return res.status(400).json({
        error: "Missing required fields: id, name, role",
      } as ErrorResponse);
    }

    // Check if credential already exists
    if (await db.credentialExists(credential.id)) {
      logger.info("Credential already exists", { id: credential.id });
      return res.status(409).json({
        message: "credential already issued",
      } as IssuanceResponse);
    }

    // Save the credential
    await db.saveCredential(credential, workerId);
    const timestamp = new Date().toISOString();

    logger.info("Credential issued", {
      id: credential.id,
      workerId,
      timestamp,
    });

    return res.status(201).json({
      message: `credential issued by ${workerId}`,
      timestamp,
    } as IssuanceResponse);
  } catch (error) {
    logger.error("Error issuing credential", { error });
    return res.status(500).json({
      error: "Internal server error",
    } as ErrorResponse);
  }
});

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", workerId });
});

export default router;
