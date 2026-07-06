import { v4 as uuidv4 } from 'uuid';

const requestId = (req, res, next) => {
  req.reqId = uuidv4();
  res.reqId = req.reqId;
  res.setHeader('X-Request-Id', req.reqId);
  next();
};

export default requestId;
