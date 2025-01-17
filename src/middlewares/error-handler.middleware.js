const errorHandler = (err, req, res, next) => {
	console.error(err);

	// joi에서 발생한 에러 처리
	if (err.name === 'ValidationError') {
		return res.status(400).json({
			status: 400,
			message: err.message,
		});
	}

	// 그 밖의 예상치 못한 에러 처리
	return res.status(500).json({
		status: 500,
		message: err.message,
	});
};

export { errorHandler };