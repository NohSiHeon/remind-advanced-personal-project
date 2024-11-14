import jwt from 'jsonwebtoken';
import { prisma } from '../../utils/prisma.util.js';
import { ACCESS_TOKEN_SECRET_KEY } from '../../constants/env.constant.js';

async function accessTokenMiddleware(req, res, next) {

	try {
		const authorization = req.headers['authorization'];

		if (!authorization) {
			return res.status(404).json({
				message: "인증 정보가 없습니다."
			});
		}

		const [tokenType, token] = authorization.split(' ');
		if (tokenType !== 'Bearer') {
			return res.status(400).json({
				message: "지원하지 않는 인증 방식입니다."
			});
		}

		const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
		const userId = decodedToken.payload;

		const user = await prisma.user.findFirst({
			where: {
				id: +userId
			},
			select: {
				id: true
			}
		});

		if (!user) {
			return res.status(400).json({
				message: "인증 정보와 일치하는 사용자가 없습니다."
			});
		}

		req.user = user.id;

		next();
	} catch (error) {
		return res.status(400).json({
			message: "인증 정보가 유효하지 않습니다."
		})
	}
}

export { accessTokenMiddleware };