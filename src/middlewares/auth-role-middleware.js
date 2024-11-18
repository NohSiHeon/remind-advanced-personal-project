import { prisma } from "../utils/prisma.util.js";

function roleMiddleware(...role) {
	return async (req, res, next) => {
		try {
			const userId = req.user;
			const user = await prisma.user.findFirst({
				where: {
					id: +userId
				}
			});

			if (!role.includes(user.role)) {
				return res.status(403).json({
					message: "접근 권한이 없습니다."
				})
			}

			next();

		} catch (error) {
			return res.status(400).json({
				message: "오류 발생"
			});
		}
	}
}

export { roleMiddleware };