import env from "@/env";
import { pgDatabaseUrl } from "./serverConfig";

const constant = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  frontBaseUrl: "https://gonetwork.com.bd",
  siteBaseUrl: "",
  // databaseUrl:
  //   process.env.DATABASE ||
  //   "postgresql://postgres.rrlawkhwcobqccnospvo:rxRjoHQKeQeWjHwN@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  databaseUrl:
    process.env.DATABASE ||
    "postgresql://postgres.qfwindvnpuafbnulqxow:66NnLfuyFOg3fzpF@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
};

export default constant;
