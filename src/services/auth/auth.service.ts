import { AuthResponse } from "../../controllers/user/auth/auth.types";
import { AuthUtils } from "../../controllers/user/auth/auth.utils";
import { userService } from "../user/user.service";


export class AuthService {
  async register(userData: { name?: string; email: string; password: string }): Promise<AuthResponse> {
    const { name, email, password } = userData;

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await AuthUtils.hashPassword(password);

    const user = await userService.createUser({
      email,
      name,
      password: hashedPassword,
    });

    const accessToken = AuthUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = AuthUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await userService.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await AuthUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = AuthUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = AuthUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; name: string | null };
  }> {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const decoded = AuthUtils.verifyRefreshToken(refreshToken);
    
    const user = await userService.getUserById(decoded.userId);
    
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = AuthUtils.generateAccessToken({ 
      userId: user.id, 
      email: user.email 
    });

    const newRefreshToken = AuthUtils.generateRefreshToken({ 
      userId: user.id, 
      email: user.email 
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }
}

export const authService = new AuthService();