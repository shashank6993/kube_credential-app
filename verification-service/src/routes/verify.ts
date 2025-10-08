import { Router, Request, Response } from "express";
import {
  Credential,
  VerificationResponse,
  ErrorResponse,
} from "../types/credential";
import DatabaseService from "../services/database";
import { getWorkerId } from "../utils/workerId";
import logger from "../utils/logger";

const router = Router();
const db = new DatabaseService(process.env.DATABASE_URL);
const workerId = getWorkerId();

router.post("/verify", async (req: Request, res: Response) => {
  try {
    const credential: Credential = req.body;

    // Validate required fields
    if (!credential.id || !credential.name || !credential.role) {
      logger.warn("Invalid credential data", { body: req.body });
      return res.status(400).json({
        error: "Missing required fields: id, name, role",
      } as ErrorResponse);
    }

    // Verify the credential
    const record = await db.verifyCredential(credential);

    if (!record) {
      logger.info("Credential not found or mismatch", { id: credential.id });
      return res.status(404).json({
        error: "credential not found",
      } as ErrorResponse);
    }

    logger.info("Credential verified", {
      id: credential.id,
      issuedBy: record.workerId,
      verifiedBy: workerId,
    });

    return res.status(200).json({
      message: "credential verified",
      workerId: record.workerId,
      timestamp: record.timestamp,
      credential: JSON.parse(record.data),
    } as VerificationResponse);
  } catch (error) {
    logger.error("Error verifying credential", { error });
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
