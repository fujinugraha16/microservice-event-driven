import express from "express";

// middlewares
import { validateParamId, requireAuth } from "@fujingr/common";

// constants
import { Role } from "@fujingr/common";

// models
import { Article } from "../../models/article";
import { Lot } from "../../models/lot";

// errors
import { NotFoundError, ForbiddenError } from "@fujingr/common";

// events
import { natsWrapper } from "../../nats-wrapper";
import { ArticleDeletedPublisher } from "../../events/publisher/article-deleted-publisher";

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

    const totalLotDocs = await Lot.find({
      article: article.id,
    }).countDocuments();
    if (totalLotDocs > 0) {
      throw new ForbiddenError("Article has been used by other documents");
    }

    await Article.findByIdAndRemove(id);

    // publish event
    await new ArticleDeletedPublisher(natsWrapper.client).publish({ id });

    res.status(204).send({ success: true });
  }
);

export { router as deleteArticleRouter };
