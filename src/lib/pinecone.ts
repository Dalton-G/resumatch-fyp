import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "@/config/env";

const pc: Pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export default pc;
