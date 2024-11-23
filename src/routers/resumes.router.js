import express from "express";
import { accessTokenMiddleware } from "../middlewares/auth-access-token-middleware.js";
import { prisma } from "../utils/prisma.util.js";
import { resumeValidator } from "../middlewares/validators/resume-validator.middleware.js";
import { roleMiddleware } from "../middlewares/auth-role-middleware.js";

const resumeRouter = express.Router();

// 이력서 생성
resumeRouter.post('/create', resumeValidator, accessTokenMiddleware, async (req, res, next) => {
	try {
		const userId = req.user;
		const { title, introduce } = req.body;

		if (!title) {
			throw new Error("제목을 입력해 주세요.");
		}

		if (!introduce) {
			throw new Error("자기소개를 입력해 주세요.");
		}

		const user = await prisma.user.findUnique({
			where: {
				id: +userId
			}
		});

		if (!user) {
			throw new Error("존재하지 않는 유저입니다.");
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
		});
	} catch (error) {
		next(error);
	}
});

// 이력서 목록 조회
resumeRouter.get('/', accessTokenMiddleware, async (req, res, next) => {
	try {
		const userId = req.user;
		let { sort } = req.query;
		const user = await prisma.user.findUnique({
			where: {
				id: +userId
			}
		});

		if (!sort) {
			sort = 'desc';
		}
		if (!user) {
			throw new Error("존재하지 않는 유저입니다.");
		}

		// 채용 담당자일 경우
		if (user.role == 'RECRUITER') {
			let { status } = req.query;
			status = status ? { status } : {};


			const anyResumes = await prisma.resume.findMany({
				where: status,
				select: {
					id: true,
					title: true,
					introduce: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					user: {
						select: {
							name: true
						}
					}
				},
				orderBy: {
					createdAt: sort
				}
			});

			return res.status(200).json({
				message: "이력서 목록 조회에 성공했습니다.",
				data: anyResumes
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
			},
			orderBy: {
				createdAt: sort
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
	} catch (error) {
		next(error);
	}
});

// 이력서 상세 조회
resumeRouter.get('/:id', accessTokenMiddleware, async (req, res, next) => {
	try {

		const userId = req.user;
		const { id } = req.params;


		const user = await prisma.user.findUnique({
			where: {
				id: +userId
			}
		});

		if (!user) {
			throw new Error("존재하지 않는 유저입니다.");
		}

		if (user.role == 'RECRUITER') {
			const anyResume = await prisma.resume.findUnique({
				where: {
					id: +id
				},
				select: {
					id: true,
					title: true,
					introduce: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					user: {
						select: {
							name: true
						}
					}
				}
			});
			return res.status(200).json({
				data: anyResume
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

		if (!resume) {
			throw new Error("존재하지 않는 이력서입니다.");
		}

		return res.status(200).json({
			message: "이력서 상세 조회에 성공했습니다.",
			data: flattenedResume
		});
	} catch (error) {
		next(error);
	}
});

// 이력서 수정
resumeRouter.patch('/:id', accessTokenMiddleware, async (req, res, next) => {
	try {
		const userId = req.user;
		const { id } = req.params;

		const { title, introduce } = req.body;

		const user = await prisma.user.findUnique({
			where: {
				id: +userId
			}
		});

		if (!user) {
			throw new Error("존재하지 않는 유저입니다.");
		}

		const resume = await prisma.resume.findUnique({
			where: {
				id: +id
			}
		});

		if (!resume) {
			throw new Error("존재하지 않는 이력서입니다.");
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
	} catch (error) {
		next(error);
	}
});

// 이력서 삭제
resumeRouter.delete('/:id/status', accessTokenMiddleware, async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.user;

		const user = await prisma.user.findUnique({
			where: {
				id: +id
			}
		});

		if (!user) {
			throw new Error("존재하지 않는 유저입니다.");
		}

		const resume = await prisma.resume.findUnique({
			where: {
				id: +id,
				userId: +userId
			}
		});

		if (!resume) {
			throw new Error("존재하지 않는 이력서입니다.");
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
		});
	} catch (error) {
		next(error);
	}
});

// 이력서 지원 상태 변경
resumeRouter.patch('/:id/status', accessTokenMiddleware, roleMiddleware(['RECRUITER']), async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.user;
		const { updateStatus, reason } = req.body;

		// 지원 상태가 없는 경우
		if (!updateStatus) {
			throw new Error("변경하고자 하는 지원 상태를 입력해주세요.");
		}

		// 사유가 없는 경우
		if (!reason) {
			throw new Error("지원 상태 변경 사유를 입력해주세요.");
		}

		const resume = await prisma.resume.findUnique({
			where: {
				id: +id
			}
		});

		// 이력서가 없는 경우
		if (!resume) {
			throw new Error("이력서가 존재하지 않습니다.");
		}

		// 지원 상태 변경
		await prisma.resume.update({
			where: {
				id: +id
			},
			data: {
				status: updateStatus
			}
		});


		await prisma.$transaction(async (tx) => {
			await tx.resume.update({
				where: {
					id: +id
				},
				data: {
					status: updateStatus
				}
			})

			const resumeLog = await tx.resumeLog.create({
				data: {
					resumeId: +id,
					userId: +userId,
					reason: reason,
					pastStatus: resume.status,
					updateStatus: updateStatus,
				}
			});

			return res.status(200).json({
				message: "이력서 지원 상태 변경에 성공했습니다.",
				data: resumeLog
			});
		});



	} catch (error) {
		next(error);
	}
});

// 이력서 로그 목록 조회
resumeRouter.get('/:id/logs', async (req, res, next) => {
	try {
		const { id } = req.params;

		let resumeLogs = await prisma.resumeLog.findMany({
			where: {
				resumeId: +id
			},
			orderBy: {
				createdAt: 'asc'
			},
			select: {
				id: true,
				resumeId: true,
				pastStatus: true,
				reason: true,
				updateStatus: true,
				createdAt: true,
				user: {
					select: {
						name: true
					}
				}
			}
		});
		resumeLogs = resumeLogs.map(log => {
			return {
				id: log.id,
				name: log.user.name,
				resumeId: log.resumeId,
				pastStatus: log.pastStatus,
				updateStatus: log.updateStatus,
				reason: log.reason,
				createdAt: log.createdAt
			}
		});

		return res.status(200).json({
			message: "이력서 로그 목록 조회에 성공했습니다.",
			data: resumeLogs
		});
	} catch (error) {
		next(error);
	}
});
export { resumeRouter };