const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body; 

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (firstName.length < 4 || firstName.length > 50) {
    throw new Error("First name must be between 4 and 50 characters");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a stronger password");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key)
  );

  return isEditAllowed;
};

module.exports = { validateSignUpData, validateEditProfileData };
