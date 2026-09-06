import serverless from 'serverless-http'
import app from '../../src/components/server.js'

export const handler = serverless(app)
