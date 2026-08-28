// Prompts for AI features

export const summarizePrompt = (text, length) => {
  let lengthInstruction = "";
  switch (length) {
    case 'short':
      lengthInstruction = "in 1-2 sentences";
      break;
    case 'detailed':
      lengthInstruction = "in a detailed manner with several key points";
      break;
    case 'medium':
    default:
      lengthInstruction = "in a short paragraph";
      break;
  }
  return `Please summarize the following text ${lengthInstruction}. Focus on the main ideas and ignore filler content.\n\nText:\n${text}`;
};

export const keyPointsPrompt = (text) => {
  return `Extract the key points from the following text and format them as a bulleted list. Keep each point concise.\n\nText:\n${text}`;
};

export const titlePrompt = (text) => {
  return `Generate a short, concise, and descriptive title for the following notes. Return ONLY the title text, nothing else.\n\nText:\n${text}`;
};

export const tagsPrompt = (text) => {
  return `Suggest up to 5 relevant tags for the following text. 
Return the result EXACTLY as a JSON object with a single "tags" array containing lowercase strings (e.g., {"tags": ["react", "frontend", "javascript"]}). Do not include any other text.
\nText:\n${text}`;
};

export const rewritePrompt = (text, style) => {
  const styles = {
    professional: "a professional, formal tone suitable for business communication.",
    simple: "simple, plain language that is easy for anyone to understand.",
    friendly: "a friendly, conversational, and approachable tone.",
    concise: "a very concise and direct manner, removing all unnecessary words.",
    detailed: "a highly detailed manner, elaborating on concepts lightly where helpful."
  };
  const tone = styles[style] || styles.professional;
  return `Rewrite the following text using ${tone}\n\nOriginal Text:\n${text}`;
};

export const grammarPrompt = (text) => {
  return `Improve the grammar, spelling, and sentence structure of the following text. Do NOT alter any technical code blocks if they exist. Return only the improved text.\n\nText:\n${text}`;
};

export const shortenPrompt = (text) => {
  return `Make the following text shorter by reducing unnecessary words and fluff, while preserving the core meaning.\n\nText:\n${text}`;
};

export const expandPrompt = (text) => {
  return `Expand on the following text by elaborating on the core ideas and providing more context or clearer explanations. Do not introduce completely unrelated topics.\n\nText:\n${text}`;
};

export const tasksPrompt = (text) => {
  return `Extract any action items or tasks mentioned in the following text. 
Return the result EXACTLY as a JSON object with a single "tasks" array, where each element is an object with a "title" string property (e.g., {"tasks": [{"title": "Finish API docs"}, {"title": "Test login"}]}). Do not include any other text.
\nText:\n${text}`;
};

export const assistantPrompt = (noteContent, userPrompt) => {
  return `You are SnapNote AI, a helpful AI assistant built into a note-taking application. 
You are currently helping the user with their note. Answer their request using the context of the note provided below. If the request is unrelated to the note, you can still answer it but prioritize the context if relevant.

Note Context:
${noteContent}

User Request:
${userPrompt}
`;
};
