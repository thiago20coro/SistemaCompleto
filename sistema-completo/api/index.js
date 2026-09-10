import app from '../src/components/server.js'

export default function handler(request, response) {
	if (request.url?.startsWith('/api')) {
		request.url = request.url.slice(4) || '/'
	}
	return app(request, response)
}