import express from "express";
import { prisma } from "../utils/prisma.util.js";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constants/env.constant.js";

const authRouter = express.Router();

authRouter.post('/sign-up', async (req, res, next) => {
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
		console.log("#####1111");
		console.log(SALT_ROUNDS);
		// 비밀번호 해쉬화
		const hashedPassword = bcrypt.hashSync(password, +SALT_ROUNDS);

		console.log("#####2222");
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
		return res.status(400).json({
			message: "오류 발생"
		});
	}
});
authRouter.post('/sign-in', async (req, res, next) => {
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
			throw new Error("비밀번호가 일치하지 않습니다.")
		}

		return res.status(200).json({
			message: "로그인 성공"
		});

	} catch (error) {
		return res.status(400).json({
			message: "오류 발생"
		})
	}
});

export { authRouter };