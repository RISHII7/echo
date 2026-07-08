import { RAG } from "@convex-dev/rag"
import { google } from "@ai-sdk/google"

import { components } from "../../_generated/api"

const rag = new RAG(components.rag, {
  textEmbeddingModel: google.textEmbeddingModel("gemini-embedding-001", {
    outputDimensionality: 1536,
  }),
  embeddingDimension: 1536,
})

export default rag
