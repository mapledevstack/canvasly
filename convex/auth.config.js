const isProduction = process.env.NODE_ENV === "production"

export default {
  providers: [
    {
      domain: isProduction
        ? "https://clerk.canvas.snowfluff.online"
        : "https://popular-grub-6856.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
}
