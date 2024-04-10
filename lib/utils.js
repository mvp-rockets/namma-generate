exports.validateUrl = (input) => {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(
      input,
    )
      ? true
      : 'You must provide a valid URL.';
};

exports.validateNamespace = (input) => {
  return /^[a-z_\d]+$/.test(input)
    ? true
    : "Name must consist of lower characters, numbers and _.";
};

exports.isNotDefined = (value) => {
  return value === null || value === undefined;
};
