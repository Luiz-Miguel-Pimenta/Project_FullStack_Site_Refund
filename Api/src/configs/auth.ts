export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET ?? "fallback_dev",
    expiresIn: "1d",
  },
}
