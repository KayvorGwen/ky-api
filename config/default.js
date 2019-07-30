'use strict';

module.exports = {
	host: 'localhost',
	port: 3000,
	session: {
		name: 'kg_id',
		secert: 'kg_id',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}