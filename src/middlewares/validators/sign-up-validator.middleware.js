import Joi from "joi";

const signUpSchema = Joi.object({
	email: Joi.string().email().required().messages({
		'string.email': "이메일 형식이 올바르지 않습니다.",
		'any.required': "이메일을 입력해주세요.",
		'string.empty': "이메일은 비워둘 수 없습니다."
	}),
	password: Joi.string().min(6).required().messages({
		'any.required': "비밀번호를 입력해주세요.",
		'string.empty': "비밀번호는 비워둘 수 없습니다.",
		'string.min': "비밀번호는 최소 6자리 이상이어야 합니다."
	}),
	passwordConfirm: Joi.any().valid(Joi.ref("password")).required().messages({
		'any.only': "입력한 두 비밀번호가 일치하지 않습니다.",
		'any.required': "비밀번호 확인은 필수 입력 값입니다.",
		'string.empty': "비밀번호 확인을 입력해 주세요."
	}),
	name: Joi.string().min(2).required().messages({
		'any.required': "이름을 입력해주세요.",
		'string.min': "이름은 최소 2자 이상어야 합니다.",
		'string.empty': "이름은 비워둘 수 없습니다."
	})
});

const signUpValidator = async (req, res, next) => {
	try {
		await signUpSchema.validateAsync(req.body);
		next();
	} catch (error) {
		next(error);
	}
}

export { signUpValidator };