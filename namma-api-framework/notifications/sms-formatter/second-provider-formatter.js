module.exports.format = message => message
    .replace('%', '%%25')
    .replace('!', '%21')
    .replace('@', '%40')
    .replace('#', '%23')
    .replace('$', '%24')
    .replace('^', '%5E')
    .replace('&', '%26')
    .replace('(', '%28')
    .replace(')', '%29')
    .replace('_', '%5F')
    .replace('+', '%2B');
