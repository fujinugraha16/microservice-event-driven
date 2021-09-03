import express from "express";

// middlewares
import { validateParamId, requireAuth } from "@fujingr/common";

// constants
import { Role } from "@fujingr/common";

// models
import { Article } from "../../models/article";

// errors
import { NotFoundError } from "@fujingr/common";

// events
import { natsWrapper } from "../../nats-wrapper";
import { ArticleDeletedPublisher } from "../../events/publisher/article-deleted-event";

const router = express.Router();

router.delete(
  "/api/cloth/article/delete/:id",
  requireAuth([Role.admin, Role.employee]),
  validateParamId,
  async (req, res) => {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      throw new NotFoundError();
    }

    await Article.findByIdAndRemove(id);

    // publish event
    await new ArticleDeletedPublisher(natsWrapper.client).publish({ id });

    res.status(204).send({ success: true });
  }
);

export { router as deleteArticleRouter };
