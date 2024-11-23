import Joi from "joi";

const resumeSchema = Joi.object({
	title: Joi.string().required().messages({
		'any.required': "제목을 입력해 주세요."
	}),
	introduce: Joi.string().min(50).required().messages({
		'any.required': "자기소개를 입력해 주세요.",
		'string.min': "자기소개는 50자 이상 작성해야 합니다."
	})
});

const resumeValidator = async (req, res, next) => {
	try {
		await resumeSchema.validateAsync(req.body);
		next();
	} catch (error) {
		next(error);
	}
}

export { resumeValidator };