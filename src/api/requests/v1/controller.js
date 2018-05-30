import db from '../../../db/models';
import { errorPromise } from '../../../services/helper';

export const getRequestFeedbacks = ({ user, params, query }, res, next) => {
  const limit = Number.isNaN(parseInt(query.limit, 10)) ? 20 : parseInt(query.limit, 10); // TODO: add validation < 100
  const offset = Number.isNaN(parseInt(query.offset, 10)) ? 0 : parseInt(query.offset, 10);
  const whereFilter = {
    request_id: params.id,
  };
  return db.Feedback.findAndCountAll({
    where: whereFilter,
    limit: limit,
    offset: offset,
  })
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
};

export const createRequestFeedback = ({ user, params, body }, res, next) => {
  return db.FeedbackRequest.findById(params.id)
    .then((feedbackRequestResponse) => {
      if (!feedbackRequestResponse) {
        return errorPromise('No such feedback request!', 404);
      }
      const { dataValues: feedbackRequest } = feedbackRequestResponse;
      const feedback = {
        comment: body.comment,
        giver_id: user.id,
        person_about_id: feedbackRequest.person_about_id,
        request_id: feedbackRequest.id,
        requester_id: feedbackRequest.requester_id,
        question: feedbackRequest.question,
      };
      return db.Feedback.create(feedback);
    })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
};

export default {
  getRequestFeedbacks,
  createRequestFeedback,
};
