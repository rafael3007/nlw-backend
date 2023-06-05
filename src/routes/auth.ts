import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
// 31:58

export async function authRoutes(app: FastifyInstance) {
    app.post('/register', async (request) => {
        const bodySchema = z.object({
            code: z.string(),
        })
        const { code } = bodySchema.parse(request.body)

        const accessTokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            null,
            {
                params: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                headers: {
                    Accept: 'application/json',
                },
            },
        )

        const { access_token } = accessTokenResponse.data

        console.log(access_token)

        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: "Bearer " + access_token
            }
        })

        const userSchema = z.object({
            id: z.number(),
            login: z.string(),
            name: z.string(),
            avatar_url: z.string().url(),
        })

        const userInfo = userSchema.parse(userResponse.data)

        let user = await prisma.user.findUnique({
            where: {
                githubId: userInfo.id,
            }
        })
        console.log(userInfo)
        // se não encontrar usuario no banco de dados crie um
        if (!user) {
            user = await prisma.user.create({
                data: {
                    githubId: userInfo.id,
                    login: userInfo.login,
                    nome: userInfo.name,
                    avatarUrl: userInfo.avatar_url,
                }
            })
        }

        const token = app.jwt.sign({
            name: user.nome,
            avatarUrl: user.avatarUrl,
        }, {
            sub:user.id,
            expiresIn: '30 days',
        })

        return {
            token,
        }
    })
}
