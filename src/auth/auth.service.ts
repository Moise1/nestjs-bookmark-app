import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as  argon from 'argon2'
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ){}

    async signUp(dto: AuthDto){
        const hashPswd = await argon.hash(dto.password);
        const user  = await this.prisma.user.create({
            data:{
                email: dto.email,
                hash: hashPswd
            }
        })

        return user;
    }

    async logIn(dto: AuthDto){
        // find the user by email
        const user =
        await this.prisma.user.findUnique({
        where: {
            email: dto.email,
        },
        });
        // if user does not exist throw exception
        if (!user)
            throw new ForbiddenException(
            'Credentials incorrect',
            );

        // compare password
        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
        );
        // if password incorrect throw exception
        if (!pwMatches)
            throw new ForbiddenException(
            'Credentials incorrect',
            );
            return this.signToken(user.id, user.email);
        }


        async signToken(
            userId: number,
            email: string,
          ): Promise<{ access_token: string }> {
            const payload = {
              sub: userId,
              email,
            };
            const secret = this.config.get('JWT_SECRET');

            const token = await this.jwt.signAsync(
              payload,
              {
                expiresIn: '15m',
                secret: secret,
              },
            );

            return {access_token: token };
        }
}
