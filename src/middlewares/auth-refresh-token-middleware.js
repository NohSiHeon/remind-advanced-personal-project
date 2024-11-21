import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET_KEY } from "../constants/env.constant.js";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";

async function refreshTokenMiddleware(req, res, next) {
	try {
		const authorization = req.headers.authorization;

		let payload;
		if (!authorization) {
			throw new Error("인증 정보가 없습니다.");
		}
		const [tokenType, token] = authorization.split(" ");


		if (tokenType !== 'Bearer') {
			throw new Error("지원하지 않는 인증 방식입니다.")
		}
		if (!token) {
			throw new Error("인증 정보가 없습니다.");
		}

		try {
			payload = jwt.verify(token, REFRESH_TOKEN_SECRET_KEY);
		} catch (error) {
			if (error.name == 'TokenExpiredError') {
				throw new Error("사용할 수 없는 인증 정보입니다.");
			} else {
				throw new Error("인증 정보가 유효하지 않습니다.");
			}
		}

		const id = payload.payload;

		const user = await prisma.user.findUnique({
			where: {
				id: +id
			}
		});
		if (!user) {
			throw new Error("인증 정보와 일치하는 사용자가 없습니다.");
		}
		const refreshToken = await prisma.refreshToken.findUnique({
			where: {
				userId: +id
			}
		});

		const validToken = bcrypt.compareSync(token, refreshToken.token);

		if (!validToken || !refreshToken) {
			throw new Error("폐기된 인증 정보입니다.")
		}

		req.user = id;
		next();

	} catch (error) {
		next(error);
	}
}

export { refreshTokenMiddleware };