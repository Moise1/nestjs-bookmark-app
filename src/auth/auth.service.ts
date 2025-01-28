import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as  argon from 'argon2'
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService){}

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
            return {msg: 'Successfuly logged in'}
            // ret?urn this.signToken(user.id, user.email);
        }

}
