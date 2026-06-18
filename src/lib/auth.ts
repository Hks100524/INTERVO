export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  image?: string;
  provider?: string;
}

type AuthUserSource = {
  _id?: {
    toString(): string;
  } | string;
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  image?: string;
  provider?: string;
};

export function toAuthUser(
  user: AuthUserSource
): AuthUser {
  return {
    id:
      user.id ??
      user._id?.toString() ??
      "",
    firstName:
      user.firstName ?? "",
    lastName:
      user.lastName ?? "",
    username:
      user.username ?? "",
    email:
      user.email ?? "",
    image:
      user.image || undefined,
    provider:
      user.provider || undefined,
  };
}
