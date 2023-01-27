export const useLoginUser = () =>
  useState<{ id: string; name: string; mail: string }>("login-user", () => {
    console.log("retrieving user info...");
    return {
      id: "012345",
      name: "mamezou",
      mail: "nuxt-developer@mamezou.com",
    };
  });