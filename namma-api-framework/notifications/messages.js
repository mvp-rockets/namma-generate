const en = require('../locales/notifications/en.json');
const hi = require('../locales/notifications/hi.json');
const te = require('../locales/notifications/te.json');
const kn = require('../locales/notifications/kn.json');

const allConfig = {
    en, hi, te, kn
};

module.exports.get = (language) => {
    if (language) {
        return allConfig[language.abbreviation || 'en'];
    }
    return JSON.parse(JSON.stringify(allConfig.en));
};
