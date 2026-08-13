import { Router } from "express";
import { getAuthContext } from "../../shared/auth/get-user-id.js";
import { buildErrorResponse } from "../../shared/http/error-response.js";
import { buildListInput } from "../../shared/http/parse-pagination.js";
import {
  createCategory,
  getCategoryById,
  listCategories,
  listCategoryOptions,
  updateCategory,
} from "./service.js";

const router = Router();

function sendError(res, error) {
  const { statusCode, body } = buildErrorResponse(error);
  res.status(statusCode).json(body);
}

router.get("/", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["status", "type"]);
    if (typeof input.status === "string") {
      if (input.status === "true") {
        input.status = true;
      } else if (input.status === "false") {
        input.status = false;
      } else {
        delete input.status;
      }
    }

    const categories = await listCategories(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(categories);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/options", async (req, res) => {
  try {
    const input = buildListInput(req.query, ["status", "type"]);
    if (typeof input.status === "string") {
      if (input.status === "true") {
        input.status = true;
      } else if (input.status === "false") {
        input.status = false;
      } else {
        delete input.status;
      }
    }

    const categories = await listCategoryOptions(
      input,
      getAuthContext(req),
      req.requestId,
    );
    res.json(categories);
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/:idCategory", async (req, res) => {
  try {
    const category = await getCategoryById(
      req.params.idCategory,
      getAuthContext(req),
      req.requestId,
    );
    res.json(category);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await createCategory(
      req.body,
      getAuthContext(req),
      req.requestId,
    );
    res.status(201).json(category);
  } catch (error) {
    sendError(res, error);
  }
});

router.patch("/:idCategory", async (req, res) => {
  try {
    const category = await updateCategory(
      {
        idCategory: req.params.idCategory,
        name: req.body?.name,
        type: req.body?.type,
        status: req.body?.status,
      },
      getAuthContext(req),
      req.requestId,
    );
    res.json(category);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
