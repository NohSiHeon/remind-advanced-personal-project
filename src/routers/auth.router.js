import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY, SALT_ROUNDS } from "../constants/env.constant.js";
import { signUpValidator } from "../middlewares/validators/sign-up-validator.middleware.js";
import { signInValidator } from "../middlewares/validators/sign-in-validator.middleware.js";
import jwt from "jsonwebtoken";
import { refreshTokenMiddleware } from "../middlewares/auth-refresh-token-middleware.js";

const authRouter = express.Router();

// 회원가입
authRouter.post('/sign-up', signUpValidator, async (req, res, next) => {
	try {

		const { email, password, passwordConfirm, name } = req.body;

		// 같은 이메일이 있는지 조회
		const existedUser = await prisma.user.findUnique({
			where: { email }
		});

		// 이미 존재하는 이메일인지 확인
		if (existedUser) {
			throw new Error("이미 존재하는 이메일입니다.");
		}

		// 두 비밀번호가 같은지 확인
		if (password !== passwordConfirm) {
			throw new Error("입력한 두 비밀번호가 일치하지 않습니다.");
		}

		// 비밀번호 해쉬화
		const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);


		// DB에 유저 생성
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			}
		});

		// 비밀번호 감추기
		user.password = undefined;

		return res.status(201).json({
			data: user
		});


	} catch (error) {
		next(error);
	}
});

// 로그인
authRouter.post('/sign-in', signInValidator, async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email) {
			throw new Error("이메일을 입력해주세요.");
		}

		if (!password) {
			throw new Error("비밀번호를 입력해주세요.");
		}

		const existedUser = await prisma.user.findUnique({
			where: { email }
		});

		if (!existedUser) {
			throw new Error("존재하지 않는 이메일입니다.");
		}
		const matchedPassword = await bcrypt.compare(password, existedUser.password);

		if (!matchedPassword) {
			throw new Error("비밀번호가 일치하지 않습니다.");
		}
		const payload = existedUser.id;
		const accessToken = jwt.sign({ payload }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: "1h" });
		const refreshToken = jwt.sign({ payload }, REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7d" });



		await prisma.refreshToken.upsert({
			where: {
				userId: existedUser.id
			},
			update: {
				token: refreshToken
			},
			create: {
				userId: existedUser.id,
				token: refreshToken
			}
		});

		return res.status(200).json({
			message: "로그인 성공",
			data: {
				accessToken,
				refreshToken
			}
		});
	} catch (error) {
		next(error);
	}
});

// 로그아웃
authRouter.delete('/sign-out', refreshTokenMiddleware, async (req, res, next) => {
	const id = req.user;

	const token = await prisma.refreshToken.findUnique({
		where: {
			userId: +id
		}
	});

	await prisma.refreshToken.delete({
		where: {
			userId: +id
		}
	});

	return res.status(200).json({
		message: "로그아웃에 성공했습니다.",
		data: id
	});
});
export { authRouter };