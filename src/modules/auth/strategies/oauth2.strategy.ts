import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor() {
    const authURL = process.env.OAUTH_AUTHORIZATION_URL || 'https://example.com/oauth/authorize';
    const tokenURL = process.env.OAUTH_TOKEN_URL || 'https://example.com/oauth/token';
    const clientID = process.env.OAUTH_CLIENT_ID || 'dummy-client-id';
    const clientSecret = process.env.OAUTH_CLIENT_SECRET || 'dummy-client-secret';
    const callbackURL =
      process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/oauth2/callback';

    super({
      authorizationURL: authURL,
      tokenURL: tokenURL,
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // This method is called after successful OAuth2 authentication
    // The profile parameter contains the user information from the OAuth2 provider
    return {
      accessToken,
      refreshToken,
      profile,
    };
  }
}
