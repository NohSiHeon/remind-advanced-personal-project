import express from "express";
import { accessTokenMiddleware } from "../middlewares/validators/auth-access-token-middleware.js";
import { prisma } from "../utils/prisma.util.js";
import { resumeValidator } from "../middlewares/validators/resume-validator.middleware.js";

const resumeRouter = express.Router();

// 이력서 생성
resumeRouter.post('/create', resumeValidator, accessTokenMiddleware, async (req, res, next) => {
	const userId = req.user;
	const { title, introduce } = req.body;

	if (!title) {
		return res.status(400).json({
			message: "제목을 입력해 주세요."
		});
	}

	if (!introduce) {
		return res.status(400).json({
			message: "자기소개를 입력해 주세요."
		});
	}

	const user = await prisma.user.findUnique({
		where: {
			id: +userId
		}
	});

	if (!user) {
		return res.status(404).json({
			message: "존재하지 않는 유저입니다."
		});
	}

	const resume = await prisma.resume.create({
		data: {
			title,
			introduce,
			userId
		}
	});

	return res.status(201).json({
		message: "이력서 작성을 완료했습니다.",
		data: resume
	})
});

// 이력서 목록 조회
resumeRouter.get('/', accessTokenMiddleware, async (req, res, next) => {
	const userId = req.user;

	const user = await prisma.user.findUnique({
		where: {
			id: +userId
		}
	});

	if (!user) {
		return res.status(404).json({
			message: "존재하지 않는 유저입니다."
		});
	}

	const resumes = await prisma.resume.findMany({
		where: {
			userId: +userId
		},
		select: {
			id: true,
			title: true,
			introduce: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		}
	});

	const flattenedResume = resumes.map(resume => ({
		...resume,
		name: user.name
	}));

	return res.status(200).json({
		message: "이력서 목록 조회에 성공했습니다.",
		data: flattenedResume
	});
});

// 이력서 상세 조회
resumeRouter.get('/:id', accessTokenMiddleware, async (req, res, next) => {
	const userId = req.user;
	const { id } = req.params;

	const user = await prisma.user.findUnique({
		where: {
			id: +userId
		}
	});

	if (!user) {
		return res.status(404).json({
			message: "존재하지 않는 유저입니다."
		});
	}

	const resume = await prisma.resume.findUnique({
		where: {
			userId: +userId,
			id: +id
		},
		select: {
			id: true,
			title: true,
			introduce: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		}
	});

	const flattenedResume = {
		...resume,
		name: user.name
	}

	console.log(flattenedResume);

	if (!resume) {
		return res.status(404).json({
			message: "존재하지 않는 이력서입니다."
		})
	}

	return res.status(200).json({
		message: "이력서 상세 조회에 성공했습니다.",
		data: flattenedResume
	});
});

// 이력서 수정
resumeRouter.patch('/:id', accessTokenMiddleware, async (req, res, next) => {
	const userId = req.user;
	const { id } = req.params;
	console.log(id);
	const { title, introduce } = req.body;

	const user = await prisma.user.findUnique({
		where: {
			id: +userId
		}
	});

	if (!user) {
		return res.status(404).json({
			message: "존재하지 않는 유저입니다."
		});
	}

	const resume = await prisma.resume.findUnique({
		where: {
			id: +id
		}
	});

	if (!resume) {
		return res.status(404).json({
			message: "존재하지 않는 이력서입니다."
		});
	}

	const updateResume = await prisma.resume.update({
		where: {
			userId: +userId,
			id: +id
		},
		data: {
			title,
			introduce
		}
	});

	return res.status(200).json({
		message: "이력서 수정에 성공했습니다.",
		data: updateResume
	});
});

// 이력서 삭제
resumeRouter.delete('/:id', accessTokenMiddleware, async (req, res, next) => {
	const { id } = req.params;
	const userId = req.user;

	const user = await prisma.user.findUnique({
		where: {
			id: +id
		}
	});

	if (!user) {
		return res.status(404).json({
			message: "존재하지 않는 유저입니다."
		});
	}

	const resume = await prisma.resume.findUnique({
		where: {
			id: +id,
			userId: +userId
		}
	});

	if (!resume) {
		return res.status(404).json({
			message: "존재하지 않는 이력서입니다."
		});
	}

	await prisma.resume.delete({
		where: {
			id: +id,
			userId: +userId
		}
	});

	return res.status(200).json({
		message: "이력서 삭제에 성공했습니다.",
		data: resume.id
	})
});
export { resumeRouter };