// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

const constant = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ||
    (isProduction ? "https://hq.nnsbd.org" : "http://localhost:3000"),
  frontBaseUrl: isProduction
    ? "https://hq.nnsbd.org"
    : "https://gonetwork.com.bd",
  siteBaseUrl: "",
  // databaseUrl:
  //   process.env.DATABASE ||
  //   "postgresql://postgres.rrlawkhwcobqccnospvo:rxRjoHQKeQeWjHwN@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres.qfwindvnpuafbnulqxow:66NnLfuyFOg3fzpF@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
};

export default constant;
