import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

export default generateToken;
