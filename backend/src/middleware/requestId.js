import { randomUUID as uuidv4 } from 'crypto';

const requestId = (req, res, next) => {
  req.reqId = uuidv4();
  res.reqId = req.reqId;
  res.setHeader('X-Request-Id', req.reqId);
  next();
};

export default requestId;
