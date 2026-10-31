import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'fallback-dev-secret',
      ),
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
