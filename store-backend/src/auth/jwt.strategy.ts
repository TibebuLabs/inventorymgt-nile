import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { resolveJwtSecret } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(),
    });
  }

  async validate(payload: any) {
    // This object is attached to request.user in every guarded route.
    // `name` is required by the audit trail, so it must travel in the token.
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? payload.email,
    };
  }
}
