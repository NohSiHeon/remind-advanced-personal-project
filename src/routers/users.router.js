import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { accessTokenMiddleware } from "../middlewares/validators/auth-access-token-middleware.js";

const userRouter = express.Router();

userRouter.get('/', accessTokenMiddleware, async (req, res, next) => {
	const userId = req.user;

	const user = await prisma.user.findFirst({
		where: {
			id: +userId
		},
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
			updatedAt: true
		}
	});
	console.log(user);
	return res.status(200).json({
		message: "조회에 성공했습니다.",
		data: {
			user
		}
	})
});

export { userRouter };