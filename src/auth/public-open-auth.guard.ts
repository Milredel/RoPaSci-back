import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PublicOpenAuthGuard extends AuthGuard('jwt') implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            jwt.verify(request.headers.authorization.substring(7, request.headers.authorization.length), process.env.STRATOS_ALPINE_SECRET);
        } catch (e) {
            return super.canActivate(context);
        }

        return true;
    }
}
