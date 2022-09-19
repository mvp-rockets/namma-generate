module.exports.standardizeMobile = (mobile) => {
    if (mobile.length === 10) {
        return `91${mobile}`;
    }
    return `${mobile}`;
};