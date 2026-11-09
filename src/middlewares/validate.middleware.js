
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Apply validated and transformed data
    req.body = result.data.body;

    next();
  };
};

export default validate;
